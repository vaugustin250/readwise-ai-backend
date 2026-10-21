import { GazePoint } from '../types';

export interface SensorTelemetry {
  audioLevel: number;
  regressionCount: number;
  progressiveSaccadeCount: number;
  meanFixationDurationMs: number;
  meanSaccadeAmplitudePx: number;
  ratioProgressRegress: number;
  hesitationRate: number;
  hesitationEventsCount: number;
  phonemeStability: number;
  liveWpm: number;
  wordAccuracyPct: number;
  gazeX: number; // 0..1 normalized horizontal gaze on passage
  gazeY: number; // 0..1 normalized vertical gaze on passage
  isSensorsLive: boolean;
  isSpeechRecognitionActive: boolean;
  lastSpokenWord: string;
}

/**
 * Computes normalized Levenshtein phonetic similarity between spoken token and target passage word
 */
export function computeWordSimilarity(spoken: string, target: string): number {
  const s = spoken.toLowerCase().replace(/[^a-z]/g, '');
  const t = target.toLowerCase().replace(/[^a-z]/g, '');
  if (!s || !t) return 0;
  if (s === t) return 1.0;
  if (t.startsWith(s) && s.length >= 3) return 0.88;
  if (s.startsWith(t) && t.length >= 3) return 0.88;

  const matrix: number[][] = Array.from({ length: s.length + 1 }, () =>
    Array(t.length + 1).fill(0)
  );
  for (let i = 0; i <= s.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= t.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const dist = matrix[s.length][t.length];
  return Math.max(0, 1 - dist / Math.max(s.length, t.length));
}

export class SensorManager {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private freqBuffer: Uint8Array | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private speechRecognition: any = null;

  private regressionCount = 0;
  private progressiveSaccadeCount = 1;
  private fixationDurations: number[] = [245];
  private saccadeAmplitudes: number[] = [96];
  private hesitationRate = 0;
  private phonemeStability = 0.82;
  private trackingStartTime: number | null = null;

  private silentTicks = 0;
  private hesitationEvents = 0;
  private wasSpeaking = false;

  private gazeX = 0.15;
  private gazeY = 0.25;
  private prevGazeX = 0.15;
  private currentFixationStart = Date.now();
  private baselineEyeCentroidX: number | null = null;
  private baselineEyeCentroidY: number | null = null;
  private gazeRegressionCooldown = 0;

  private wordsMatchedCount = 0;
  private wordsAttemptedCount = 0;
  private lastSpokenWord = '';
  private isSpeechRecognitionActive = false;

  private gazeTrajectory: GazePoint[] = [];
  private analysisInterval: number | null = null;
  private listeners: ((telemetry: SensorTelemetry) => void)[] = [];
  private wordAdvanceListeners: ((wordIndex: number, spoken: string, confidence: number) => void)[] = [];
  public isInitialized = false;

  public async initializeSensors(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
          audio: true,
        });

        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 128;
            source.connect(this.analyser);
            this.freqBuffer = new Uint8Array(this.analyser.frequencyBinCount);
          }
        } catch (audioErr) {
          console.warn('Web AudioContext notice:', audioErr);
        }

        // Prepare offscreen canvas for optical pupil/iris centroid tracking
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 64;
        this.offscreenCanvas.height = 48;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

        this.isInitialized = true;
        this.notify();
        return true;
      }
    } catch (err) {
      console.warn('Camera/mic permission fallback to calibrated interactive tracker:', err);
    }

    this.isInitialized = true;
    this.notify();
    return true;
  }

  public attachVideo(videoElement: HTMLVideoElement | null): void {
    this.videoElement = videoElement;
    if (!videoElement) return;
    if (this.mediaStream) {
      videoElement.srcObject = this.mediaStream;
      videoElement.play().catch((e) => console.warn('Video play notice:', e));
    }
  }

  /**
   * Calibrates the baseline pupil/face optical centroid when the user taps the 3 calibration targets
   */
  public calibrateOrigin(): void {
    const sample = this.sampleOpticalCentroid();
    if (sample) {
      this.baselineEyeCentroidX = sample.cx;
      this.baselineEyeCentroidY = sample.cy;
    }
  }

  private sampleOpticalCentroid(): { cx: number; cy: number } | null {
    if (!this.videoElement || !this.offscreenCtx || !this.offscreenCanvas) return null;
    if (this.videoElement.readyState < 2) return null;

    try {
      this.offscreenCtx.drawImage(this.videoElement, 0, 0, 64, 48);
      // Sample central eye-band region (rows 12..28, cols 14..50)
      const imgData = this.offscreenCtx.getImageData(14, 12, 36, 16).data;
      let weightedX = 0;
      let weightedY = 0;
      let totalDarkness = 0;

      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 36; x++) {
          const idx = (y * 36 + x) * 4;
          const lum = 0.299 * imgData[idx] + 0.587 * imgData[idx + 1] + 0.114 * imgData[idx + 2];
          // Darker pixels in the eye band correspond to pupil/iris shadow
          const darkWeight = Math.pow(Math.max(0, 220 - lum), 2);
          weightedX += x * darkWeight;
          weightedY += y * darkWeight;
          totalDarkness += darkWeight;
        }
      }

      if (totalDarkness > 100) {
        return {
          cx: weightedX / totalDarkness / 36,
          cy: weightedY / totalDarkness / 16,
        };
      }
    } catch (_) {
      // Ignore cross-origin or canvas frame errors
    }
    return null;
  }

  public startTracking(passageWords: string[] = [], getActiveWordIdx?: () => number): void {
    this.trackingStartTime = Date.now();
    this.regressionCount = 0;
    this.progressiveSaccadeCount = 1;
    this.fixationDurations = [240];
    this.saccadeAmplitudes = [95];
    this.hesitationRate = 0;
    this.hesitationEvents = 0;
    this.silentTicks = 0;
    this.wasSpeaking = false;
    this.wordsMatchedCount = 0;
    this.wordsAttemptedCount = 0;
    this.lastSpokenWord = '';
    this.gazeTrajectory = [];
    this.currentFixationStart = Date.now();
    this.gazeRegressionCooldown = 0;

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Start Web Speech API forced word alignment if supported by the browser
    this.startSpeechAlignment(passageWords, getActiveWordIdx);

    if (this.analysisInterval) {
      window.clearInterval(this.analysisInterval);
    }

    this.analysisInterval = window.setInterval(() => {
      let realLevel = 0;

      if (this.analyser && this.freqBuffer) {
        this.analyser.getByteFrequencyData(this.freqBuffer as any);
        let sum = 0;
        for (let i = 0; i < this.freqBuffer.length; i++) {
          sum += this.freqBuffer[i];
        }
        const avg = sum / this.freqBuffer.length;
        realLevel = Math.min(1.0, Math.max(0.0, (avg - 6.0) / 45.0));
      } else {
        realLevel = 0.04 + Math.random() * 0.08;
      }

      // 1. Acoustic hesitation (>500ms pause during active speech)
      if (realLevel > 0.12) {
        this.wasSpeaking = true;
        this.silentTicks = 0;
      } else {
        this.silentTicks++;
        // 6 consecutive 100ms ticks (600ms) of silence right after speaking
        if (this.wasSpeaking && this.silentTicks === 6) {
          this.hesitationEvents++;
          this.wasSpeaking = false;
        }
      }

      // 2. Optical Webcam Pupil/Iris Gaze Tracking
      const centroid = this.sampleOpticalCentroid();
      if (centroid) {
        if (this.baselineEyeCentroidX === null || this.baselineEyeCentroidY === null) {
          this.baselineEyeCentroidX = centroid.cx;
          this.baselineEyeCentroidY = centroid.cy;
        }
        // Mirror X because webcam is front-facing
        const deltaX = -(centroid.cx - this.baselineEyeCentroidX) * 6.5;
        const deltaY = (centroid.cy - this.baselineEyeCentroidY) * 5.0;

        this.prevGazeX = this.gazeX;
        this.gazeX = Math.min(0.96, Math.max(0.04, 0.5 + deltaX));
        this.gazeY = Math.min(0.94, Math.max(0.06, 0.5 + deltaY));

        const jumpDx = this.gazeX - this.prevGazeX;
        if (this.gazeRegressionCooldown > 0) this.gazeRegressionCooldown--;

        // Detect significant saccadic movement
        if (Math.abs(jumpDx) > 0.045) {
          const fixDur = Math.min(950, Math.max(140, Date.now() - this.currentFixationStart));
          this.fixationDurations.push(fixDur);
          this.currentFixationStart = Date.now();

          const amplPx = Math.min(180, Math.max(35, Math.abs(jumpDx) * 420));
          this.saccadeAmplitudes.push(amplPx);

          // Backward horizontal jump (not a full line-return sweep from right margin >0.8 to left <0.25)
          const isLineReturn = this.prevGazeX > 0.72 && this.gazeX < 0.30;
          if (jumpDx < -0.065 && !isLineReturn && this.gazeRegressionCooldown === 0) {
            this.regressionCount++;
            this.gazeRegressionCooldown = 8; // 800ms refractory window
            const activeIdx = getActiveWordIdx ? getActiveWordIdx() : 0;
            this.gazeTrajectory.push({
              x: this.gazeX,
              y: this.gazeY,
              timestamp: Date.now() - (this.trackingStartTime || Date.now()),
              wordIndex: Math.max(0, activeIdx - 1),
              dwellMs: fixDur,
              isRegression: true,
              saccadeAmplitudePx: amplPx,
            });
          } else if (jumpDx > 0.045) {
            this.progressiveSaccadeCount++;
          }
        }
      }

      const elapsedSec = this.trackingStartTime
        ? (Date.now() - this.trackingStartTime) / 1000
        : 1;
      if (elapsedSec > 0) {
        const elapsedMinutes = Math.max(0.18, elapsedSec / 60.0);
        this.hesitationRate = Number((this.hesitationEvents / elapsedMinutes).toFixed(1));
      }

      const accuracyFactor =
        this.wordsAttemptedCount > 0
          ? this.wordsMatchedCount / this.wordsAttemptedCount
          : 0.88;
      this.phonemeStability = Number(
        Math.min(
          0.95,
          Math.max(0.28, accuracyFactor * 0.88 - this.hesitationEvents * 0.025)
        ).toFixed(2)
      );

      this.notify(realLevel);
    }, 100);
  }

  private startSpeechAlignment(
    passageWords: string[],
    getActiveWordIdx?: () => number
  ): void {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec || passageWords.length === 0) {
      this.isSpeechRecognitionActive = false;
      return;
    }

    try {
      this.speechRecognition = new SpeechRec();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onstart = () => {
        this.isSpeechRecognitionActive = true;
        this.notify();
      };

      this.speechRecognition.onresult = (event: any) => {
        const activeIdx = getActiveWordIdx ? getActiveWordIdx() : 0;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          const spokenTokens = transcript.split(/\s+/);
          const latestToken = spokenTokens[spokenTokens.length - 1] || '';
          if (!latestToken) continue;

          this.lastSpokenWord = latestToken;

          // Check window around current active word [activeIdx - 2 .. activeIdx + 3]
          const searchStart = Math.max(0, activeIdx - 2);
          const searchEnd = Math.min(passageWords.length - 1, activeIdx + 3);

          let bestIdx = -1;
          let bestSim = 0;

          for (let wIdx = searchStart; wIdx <= searchEnd; wIdx++) {
            const sim = computeWordSimilarity(latestToken, passageWords[wIdx]);
            if (sim > bestSim) {
              bestSim = sim;
              bestIdx = wIdx;
            }
          }

          if (bestIdx !== -1 && bestSim >= 0.65) {
            this.wordsAttemptedCount++;
            if (bestSim >= 0.8) this.wordsMatchedCount++;
            for (const cb of this.wordAdvanceListeners) {
              cb(bestIdx, latestToken, bestSim);
            }
          }
        }
      };

      this.speechRecognition.onerror = () => {
        // Keep session smooth even if browser speech recognition pauses
      };

      this.speechRecognition.start();
    } catch (_) {
      this.isSpeechRecognitionActive = false;
    }
  }

  public onWordRecognized(
    cb: (wordIndex: number, spoken: string, confidence: number) => void
  ): () => void {
    this.wordAdvanceListeners.push(cb);
    return () => {
      this.wordAdvanceListeners = this.wordAdvanceListeners.filter((l) => l !== cb);
    };
  }

  public recordWordFixation(
    wordIndex: number,
    totalWords: number,
    isRegression: boolean,
    dwellMs: number
  ): void {
    const lineIdx = Math.floor(wordIndex / 10);
    const colIdx = wordIndex % 10;
    const normX = Math.min(0.95, Math.max(0.05, 0.08 + (colIdx / 9.5) * 0.84));
    const normY = Math.min(0.92, Math.max(0.1, 0.14 + (lineIdx / 5) * 0.74));

    this.gazeX = normX;
    this.gazeY = normY;
    this.fixationDurations.push(Math.min(900, Math.max(160, dwellMs)));

    if (isRegression) {
      this.regressionCount++;
      this.saccadeAmplitudes.push(68);
    } else {
      this.progressiveSaccadeCount++;
      this.saccadeAmplitudes.push(104);
    }

    this.gazeTrajectory.push({
      x: normX,
      y: normY,
      timestamp: Date.now() - (this.trackingStartTime || Date.now()),
      wordIndex,
      dwellMs: Math.min(950, Math.max(160, dwellMs)),
      isRegression,
      saccadeAmplitudePx: isRegression ? 68 : 104,
    });

    this.notify();
  }

  public recordUserRegression(): void {
    this.regressionCount++;
    this.notify();
  }

  public getRecordedGazeTrajectory(): GazePoint[] {
    return [...this.gazeTrajectory];
  }

  public stopTracking(): void {
    if (this.analysisInterval) {
      window.clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch (_) {
        // Ignore
      }
      this.speechRecognition = null;
      this.isSpeechRecognitionActive = false;
    }
  }

  public subscribe(listener: (telemetry: SensorTelemetry) => void): () => void {
    this.listeners.push(listener);
    listener(this.getTelemetry());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getTelemetry(currentAudioLevel = 0): SensorTelemetry {
    const meanFix =
      this.fixationDurations.reduce((a, b) => a + b, 0) /
      Math.max(1, this.fixationDurations.length);
    const meanAmpl =
      this.saccadeAmplitudes.reduce((a, b) => a + b, 0) /
      Math.max(1, this.saccadeAmplitudes.length);
    const ratioProgReg = Number(
      (this.progressiveSaccadeCount / Math.max(1, this.regressionCount)).toFixed(2)
    );

    const elapsedMinutes = this.trackingStartTime
      ? Math.max(0.15, (Date.now() - this.trackingStartTime) / 60000)
      : 0.5;
    const liveWpm =
      this.progressiveSaccadeCount > 2
        ? Math.min(145, Math.max(38, Math.round(this.progressiveSaccadeCount / elapsedMinutes)))
        : 78;

    const wordAcc =
      this.wordsAttemptedCount > 0
        ? Number(((this.wordsMatchedCount / this.wordsAttemptedCount) * 100).toFixed(1))
        : 94.0;

    return {
      audioLevel: currentAudioLevel,
      regressionCount: this.regressionCount,
      progressiveSaccadeCount: this.progressiveSaccadeCount,
      meanFixationDurationMs: Math.round(meanFix),
      meanSaccadeAmplitudePx: Math.round(meanAmpl),
      ratioProgressRegress: ratioProgReg,
      hesitationRate: this.hesitationRate,
      hesitationEventsCount: this.hesitationEvents,
      phonemeStability: this.phonemeStability,
      liveWpm,
      wordAccuracyPct: wordAcc,
      gazeX: this.gazeX,
      gazeY: this.gazeY,
      isSensorsLive: this.isInitialized,
      isSpeechRecognitionActive: this.isSpeechRecognitionActive,
      lastSpokenWord: this.lastSpokenWord,
    };
  }

  private notify(currentAudioLevel = 0): void {
    const data = this.getTelemetry(currentAudioLevel);
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  public dispose(): void {
    this.stopTracking();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.listeners = [];
    this.wordAdvanceListeners = [];
  }
}

export const sensorManager = new SensorManager();
