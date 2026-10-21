import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  Sparkles,
  CornerDownLeft,
  Eye,
  Sliders,
  CheckCircle2,
  FlaskConical,
  Volume2,
} from 'lucide-react';
import { ClayButton } from '../components/ClayButton';
import { BuddyMascotBubble } from '../components/BuddyMascotBubble';
import { ParentalConsentModal } from '../components/ParentalConsentModal';
import { sensorManager, SensorTelemetry } from '../services/sensorManager';
import { cognitiveScoreService } from '../services/cognitiveScoreService';
import { assessmentService, PASSAGE_WORDS } from '../services/assessmentService';
import {
  BenchmarkPreset,
  CLINICAL_BENCHMARK_PRESETS,
} from '../services/multimodalEngine';
import {
  ChildProfile,
  ReadingBuddy,
  AssessmentResult,
  WordTelemetry,
} from '../types';

interface ReadingAssessmentScreenProps {
  child: ChildProfile;
  buddy: ReadingBuddy;
  onAssessmentFinished: (result: AssessmentResult) => void;
  onSelectBuddy: () => void;
}

export const ReadingAssessmentScreen: React.FC<ReadingAssessmentScreenProps> = ({
  child,
  buddy,
  onAssessmentFinished,
  onSelectBuddy,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showBenchmarkDrawer, setShowBenchmarkDrawer] = useState(false);

  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [furthestWordIndex, setFurthestWordIndex] = useState(0);
  const [lastRegressionAlert, setLastRegressionAlert] = useState('');
  const [wordMap, setWordMap] = useState<WordTelemetry[]>(() =>
    PASSAGE_WORDS.map((w, i) => ({
      word: w,
      index: i,
      status: 'unread',
      dwellMs: 0,
      hesitationMs: 0,
      regressionCount: 0,
      pronunciationConfidence: 1.0,
    }))
  );

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [telemetry, setTelemetry] = useState<SensorTelemetry>({
    audioLevel: 0,
    regressionCount: 0,
    progressiveSaccadeCount: 1,
    meanFixationDurationMs: 245,
    meanSaccadeAmplitudePx: 98,
    ratioProgressRegress: 8.0,
    hesitationRate: 0,
    hesitationEventsCount: 0,
    phonemeStability: 0.84,
    liveWpm: 82,
    wordAccuracyPct: 96.0,
    gazeX: 0.2,
    gazeY: 0.3,
    isSensorsLive: false,
    isSpeechRecognitionActive: false,
    lastSpokenWord: '',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeWordRef = useRef<number>(0);
  const wordEnterTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    activeWordRef.current = activeWordIndex;
  }, [activeWordIndex]);

  useEffect(() => {
    sensorManager.initializeSensors().then(() => {
      if (videoRef.current) {
        sensorManager.attachVideo(videoRef.current);
      }
    });

    const unsubscribe = sensorManager.subscribe((data) => {
      setTelemetry(data);
    });

    const unsubSpeech = sensorManager.onWordRecognized((matchedIdx, spoken, confidence) => {
      handleWordTransition(matchedIdx, spoken, confidence);
    });

    return () => {
      unsubscribe();
      unsubSpeech();
      if (timerRef.current) window.clearInterval(timerRef.current);
      sensorManager.stopTracking();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      sensorManager.attachVideo(videoRef.current);
    }
  }, [telemetry.isSensorsLive]);

  const beginGazeCalibration = () => {
    setIsCalibrating(true);
    setCalibrationStep(0);
  };

  const handleCalibrationTargetTap = () => {
    sensorManager.calibrateOrigin();
    if (calibrationStep < 2) {
      setCalibrationStep((prev) => prev + 1);
    } else {
      setIsCalibrating(false);
      handleStartReading();
    }
  };

  const handleStartReading = () => {
    setWordMap(
      PASSAGE_WORDS.map((w, i) => ({
        word: w,
        index: i,
        status: i === 0 ? 'fluent' : 'unread',
        dwellMs: 0,
        hesitationMs: 0,
        regressionCount: 0,
        pronunciationConfidence: 1.0,
      }))
    );
    wordEnterTimeRef.current = Date.now();
    sensorManager.startTracking(PASSAGE_WORDS, () => activeWordRef.current);
    setIsRecording(true);
    setSecondsElapsed(0);
    setActiveWordIndex(0);
    setFurthestWordIndex(0);
    setLastRegressionAlert('');

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
  };

  const handleWordTransition = (
    targetIndex: number,
    spokenWord?: string,
    confidence = 0.95
  ) => {
    const now = Date.now();
    const prevIdx = activeWordRef.current;
    const spentMs = Math.min(4500, Math.max(120, now - wordEnterTimeRef.current));
    wordEnterTimeRef.current = now;

    const isRegression = targetIndex < furthestWordIndex;
    sensorManager.recordWordFixation(
      targetIndex,
      PASSAGE_WORDS.length,
      isRegression,
      spentMs
    );

    if (isRegression) {
      setLastRegressionAlert(`Backward saccade to "${PASSAGE_WORDS[targetIndex]}"`);
    } else if (targetIndex > furthestWordIndex) {
      setFurthestWordIndex(targetIndex);
      setLastRegressionAlert('');
    }

    setWordMap((prev) =>
      prev.map((item, idx) => {
        if (idx === prevIdx) {
          const totalDwell = item.dwellMs + spentMs;
          const hadHesitation = spentMs > 850;
          return {
            ...item,
            dwellMs: totalDwell,
            hesitationMs: hadHesitation ? item.hesitationMs + (spentMs - 500) : item.hesitationMs,
            status:
              item.status === 'regressed'
                ? 'regressed'
                : confidence < 0.75
                ? 'mispronounced'
                : hadHesitation
                ? 'hesitated'
                : 'fluent',
          };
        }
        if (idx === targetIndex) {
          return {
            ...item,
            regressionCount: isRegression ? item.regressionCount + 1 : item.regressionCount,
            spokenTranscript: spokenWord || item.spokenTranscript,
            pronunciationConfidence: Math.min(item.pronunciationConfidence, confidence),
            status: isRegression
              ? 'regressed'
              : confidence < 0.75
              ? 'mispronounced'
              : item.status === 'unread'
              ? 'fluent'
              : item.status,
          };
        }
        return item;
      })
    );

    setActiveWordIndex(targetIndex);
  };

  const handleWordTapped = (index: number) => {
    if (!isRecording) return;
    handleWordTransition(index);
  };

  const handleAdvanceWord = () => {
    if (!isRecording) return;
    if (activeWordIndex < PASSAGE_WORDS.length - 1) {
      handleWordTransition(activeWordIndex + 1);
    }
  };

  const handleFinishReading = async () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sensorManager.stopTracking();

    // Calculate genuine trial metrics from actual recorded reading session
    const wordsRead = Math.max(1, furthestWordIndex + 1);
    const completionRatio = wordsRead / PASSAGE_WORDS.length;
    const rawElapsedMs = Math.max(3000, secondsElapsed * 1000);
    // Project full passage dwell time proportionally if user finished early, or use exact time
    const effectiveDwellMs =
      completionRatio >= 0.65
        ? rawElapsedMs
        : Math.round(rawElapsedMs / Math.max(0.25, completionRatio));

    const actualRegressions = telemetry.regressionCount;
    const actualMeanFixDur = telemetry.meanFixationDurationMs;
    const actualRatioProgReg = Number(
      (Math.max(wordsRead, telemetry.progressiveSaccadeCount) / Math.max(1, actualRegressions)).toFixed(2)
    );
    const actualSaccAmpl = telemetry.meanSaccadeAmplitudePx;
    const actualHesitations = telemetry.hesitationRate;
    const actualPhonemeStability = telemetry.phonemeStability;

    setIsRecording(false);
    setIsAnalyzing(true);
    setAnalysisStatus(
      'Stage 1/3: Running 1D-CNN + Bi-LSTM temporal encoder on recorded (X, Y, t) gaze trajectory...'
    );

    await new Promise((r) => setTimeout(r, 450));
    setAnalysisStatus(
      'Stage 2/3: Fusing 17 ocular, acoustic & cognitive biomarkers into calibrated XGBoost ensemble...'
    );

    const childId = parseInt(child.id, 10) || 1;
    const measuredWM = cognitiveScoreService.getWorkingMemory(child.id);
    const measuredPhono = cognitiveScoreService.getPhonologicalAwareness(child.id);

    const result = await assessmentService.submitAssessment({
      childId,
      dwellTimeTrial: effectiveDwellMs,
      nRegressTrial: actualRegressions,
      meanFixDurTrial: actualMeanFixDur,
      ratioProgressRegressTrial: actualRatioProgReg,
      meanSaccAmplTrial: actualSaccAmpl,
      speechHesitationRate: actualHesitations,
      speechPhonemeStability: actualPhonemeStability,
      cognitiveWorkingMemory: measuredWM,
      phonologicalAwarenessScore: measuredPhono,
      readingSpeedWpm: telemetry.liveWpm,
      wordAccuracyPct: telemetry.wordAccuracyPct,
      gazeTrajectory: sensorManager.getRecordedGazeTrajectory(),
      wordTelemetry: wordMap,
      captureMode: 'live_sensors',
    });

    setAnalysisStatus(
      'Stage 3/3: Computing exact Tree SHAP values & 150-sample LIME local explanations...'
    );
    await new Promise((r) => setTimeout(r, 450));

    setIsAnalyzing(false);
    onAssessmentFinished(result);
  };

  const handleLoadBenchmarkPreset = async (preset: BenchmarkPreset) => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sensorManager.stopTracking();
    setIsRecording(false);
    setShowBenchmarkDrawer(false);
    setIsAnalyzing(true);
    setAnalysisStatus(`Loading verified clinical profile: ${preset.name}...`);

    await new Promise((r) => setTimeout(r, 400));
    setAnalysisStatus(
      'Running 17-feature two-stage hybrid inference + Tree SHAP + LIME explanation...'
    );

    const childId = parseInt(child.id, 10) || 1;
    // Also sync the cognitive scores for this child so the profile reflects the benchmark
    cognitiveScoreService.recordScores(
      child.id,
      preset.cognitiveWorkingMemory,
      preset.phonologicalAwarenessScore
    );

    const result = await assessmentService.submitAssessment({
      childId,
      dwellTimeTrial: preset.dwellTimeMs,
      nRegressTrial: preset.nRegress,
      meanFixDurTrial: preset.meanFixDurMs,
      ratioProgressRegressTrial: preset.ratioProgReg,
      meanSaccAmplTrial: preset.meanSaccAmplPx,
      speechHesitationRate: preset.speechHesitationRate,
      speechPhonemeStability: preset.speechPhonemeStability,
      cognitiveWorkingMemory: preset.cognitiveWorkingMemory,
      phonologicalAwarenessScore: preset.phonologicalAwarenessScore,
      readingSpeedWpm: preset.readingSpeedWpm,
      wordAccuracyPct: preset.wordAccuracyPct,
      captureMode: 'benchmark_preset',
      presetName: preset.name,
    });

    await new Promise((r) => setTimeout(r, 350));
    setIsAnalyzing(false);
    onAssessmentFinished(result);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Top Bar: Buddy Mascot + Clinical Benchmark Tester Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <BuddyMascotBubble
            buddy={buddy}
            message={
              isRecording
                ? `${buddy.name}: "Read aloud! My eye & voice sensors advance each word automatically as you speak!"`
                : `${buddy.name}: "${buddy.tagline}"`
            }
            onBuddyTap={onSelectBuddy}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowBenchmarkDrawer((prev) => !prev)}
          className="self-stretch sm:self-auto px-4 py-3 rounded-2xl bg-white border-2 border-indigo-200 hover:border-indigo-400 text-[#1E1B4B] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <FlaskConical className="w-4 h-4 text-indigo-600" />
          <span>ETDD70 Clinical Profiles</span>
        </button>
      </div>

      {/* Collapsible Clinical Benchmark Verification Drawer */}
      {showBenchmarkDrawer && (
        <div className="bg-white rounded-3xl border-2 border-indigo-200 p-4 sm:p-5 shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h4 className="font-black text-sm text-[#1E1B4B] flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-indigo-600" />
                <span>Verified ETDD70 & Tri-Modal Clinical Benchmark Cases</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Test the 17-feature hybrid model against empirical clinical phenotypes to verify classification sensitivity and SHAP/LIME attributions:
              </p>
            </div>
            <button
              onClick={() => setShowBenchmarkDrawer(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CLINICAL_BENCHMARK_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleLoadBenchmarkPreset(preset)}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-black text-xs text-[#1E1B4B]">{preset.name}</span>
                    <span className="text-[10px] font-black text-indigo-700 whitespace-nowrap">
                      {preset.expectedRiskLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{preset.subtitle}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 tabular-nums">
                  <span>Regressions: {preset.nRegress}</span>
                  <span>·</span>
                  <span>Fixation: {preset.meanFixDurMs}ms</span>
                  <span>·</span>
                  <span>Pauses: {preset.speechHesitationRate}/min</span>
                  <span className="text-indigo-600 font-black">Run ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Point Quick Gaze Calibration Overlay */}
      {isCalibrating && (
        <div className="bg-[#1E1B4B] text-white rounded-3xl p-6 relative min-h-[260px] flex flex-col items-center justify-between border-2 border-indigo-400 shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Webcam Iris & Head-Pose Calibration ({calibrationStep + 1}/3)
            </span>
            <h3 className="text-lg font-black">
              Look at the glowing {buddy.name} star and tap it!
            </h3>
            <p className="text-xs text-slate-300">
              Locks your front-camera pupil coordinates onto the reading passage boundaries.
            </p>
          </div>

          <div className="relative w-full h-36 my-2 bg-slate-900/70 rounded-2xl border border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={handleCalibrationTargetTap}
              style={{
                left: calibrationStep === 0 ? '14%' : calibrationStep === 1 ? '50%' : '86%',
                top: calibrationStep === 0 ? '25%' : calibrationStep === 1 ? '50%' : '75%',
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-amber-400 text-[#1E1B4B] border-4 border-white shadow-lg flex flex-col items-center justify-center font-black text-lg cursor-pointer hover:scale-110 transition-all"
            >
              <span>{buddy.emoji}</span>
            </button>
          </div>

          <div className="flex items-center justify-between w-full text-xs text-slate-300">
            <span>Keep head steady in webcam preview</span>
            <button
              type="button"
              onClick={() => {
                setIsCalibrating(false);
                handleStartReading();
              }}
              className="underline font-bold text-amber-300 hover:text-white"
            >
              Skip Calibration ➔
            </button>
          </div>
        </div>
      )}

      {/* Live Multimodal Sensor HUD Bar (Webcam Iris Tracker + ASR Speech Alignment) */}
      <div
        style={{
          borderColor: isRecording ? buddy.themePrimary : '#E2E8F0',
          boxShadow: `0 4px 14px ${buddy.themeShadow}1a`,
        }}
        className="bg-white rounded-3xl border-2 p-3.5 sm:p-4 flex flex-col md:flex-row items-center gap-4 transition-all"
      >
        {/* Live Camera Box with Dynamic Iris Gaze Reticle HUD */}
        <div className="relative w-40 h-28 rounded-2xl bg-black overflow-hidden shrink-0 border-2 border-slate-700 shadow-inner">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {!telemetry.isSensorsLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs">
              <Video className="w-6 h-6 mb-1 opacity-50" />
              <span>Camera Simulator</span>
            </div>
          )}

          {/* Moving Gaze Vector Reticle inside Camera HUD */}
          <div
            style={{
              left: `${Math.min(88, Math.max(12, telemetry.gazeX * 100))}%`,
              top: `${Math.min(82, Math.max(18, telemetry.gazeY * 100))}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-emerald-400 bg-emerald-400/20 pointer-events-none transition-all duration-100 flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
          </div>

          <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-emerald-300 tabular-nums">
            <span>GAZE ({Math.round(telemetry.gazeX * 100)}%, {Math.round(telemetry.gazeY * 100)}%)</span>
            <span>{telemetry.meanFixationDurationMs}ms</span>
          </div>
        </div>

        {/* Real-Time Sensor Telemetry Grid */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {telemetry.audioLevel > 0.1 ? (
                <Mic className="w-4 h-4 text-emerald-600" />
              ) : (
                <MicOff className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-extrabold text-[#1E1B4B]">
                {telemetry.isSpeechRecognitionActive
                  ? 'Live ASR Word Alignment Active'
                  : 'Acoustic Prosody & Pause Meter'}
              </span>
              {telemetry.lastSpokenWord && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Heard: &ldquo;{telemetry.lastSpokenWord}&rdquo;
                </span>
              )}
            </div>

            <span
              style={{ color: buddy.themePrimary }}
              className="font-black text-sm tabular-nums"
            >
              ⏱ {formatTimer(secondsElapsed)}
            </span>
          </div>

          {/* Audio VU Meter */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
            <div
              style={{
                width: isRecording ? `${Math.min(100, Math.max(4, telemetry.audioLevel * 100))}%` : '0%',
                backgroundColor:
                  telemetry.audioLevel > 0.45 ? buddy.themeSecondary : buddy.themePrimary,
              }}
              className="h-full rounded-full transition-all duration-100"
            />
          </div>

          {/* 4 Live Biometric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-xs tabular-nums">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 block">
                Ocular Regressions
              </span>
              <span
                className={`font-black text-sm ${
                  telemetry.regressionCount >= 14 ? 'text-rose-600' : 'text-[#1E1B4B]'
                }`}
              >
                {telemetry.regressionCount} jumps
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 block">
                Mean Fixation
              </span>
              <span className="font-black text-sm text-[#1E1B4B]">
                {telemetry.meanFixationDurationMs} ms
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 block">
                Hesitations (&gt;500ms)
              </span>
              <span className="font-black text-sm text-[#1E1B4B]">
                {telemetry.hesitationRate}/min
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 block">
                Live Cadence
              </span>
              <span className="font-black text-sm text-[#1E1B4B]">
                {telemetry.liveWpm} WPM
              </span>
            </div>
          </div>

          {lastRegressionAlert && (
            <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>{lastRegressionAlert}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dyslexia-Friendly Reading Passage Card with Live Gaze Spotlight & Word Tracker */}
      <div
        style={{
          borderColor: `${buddy.themePrimary}33`,
          boxShadow: `0 6px 20px ${buddy.themeShadow}15`,
        }}
        className="bg-[#FFFDF5] rounded-3xl border-2 p-5 sm:p-6 space-y-4 relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">{buddy.emoji}</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1E1B4B]">
                The Brave Little Squirrel
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Grade-leveled meaningful passage (T4 Task • {PASSAGE_WORDS.length} words)
              </p>
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  // Allow quick regression test by stepping back 1 word
                  if (activeWordIndex > 0) {
                    handleWordTransition(activeWordIndex - 1);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs transition-colors cursor-pointer"
                title="Simulate backward eye regression jump"
              >
                ↶ Back Regression
              </button>
              <ClayButton
                text="Next Word ➔"
                onClick={handleAdvanceWord}
                color={buddy.themeSecondary}
                shadowColor={buddy.themeShadow}
                textColor="#1E1B4B"
                depth={3}
                fontSize={13}
                className="py-1.5 px-3"
              />
            </div>
          )}
        </div>

        {/* Word Wrap Box */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 py-3 leading-loose relative">
          {PASSAGE_WORDS.map((word, i) => {
            const isCurrent = isRecording && i === activeWordIndex;
            const wt = wordMap[i];
            const isRegressed = wt?.status === 'regressed';
            const isHesitated = wt?.status === 'hesitated';
            const isCompleted = isRecording && i < activeWordIndex;

            return (
              <span
                key={i}
                onClick={() => handleWordTapped(i)}
                style={{
                  backgroundColor: isCurrent
                    ? buddy.themeSecondary
                    : isRegressed
                    ? '#FFE4E6'
                    : isHesitated
                    ? '#FEF3C7'
                    : isCompleted
                    ? buddy.themeSurface
                    : '#FFFFFF',
                  borderColor: isCurrent
                    ? buddy.themeShadow
                    : isRegressed
                    ? '#F43F5E'
                    : isHesitated
                    ? '#F59E0B'
                    : isCompleted
                    ? `${buddy.themePrimary}44`
                    : '#E2E8F0',
                  boxShadow: isCurrent ? `0 4px 0 0 ${buddy.themeShadow}` : 'none',
                }}
                className={`text-lg sm:text-2xl font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none relative ${
                  isCurrent
                    ? 'font-black scale-105 text-[#1E1B4B]'
                    : 'text-[#1E1B4B] hover:bg-slate-50'
                }`}
              >
                {word}
                {wt?.regressionCount > 0 && (
                  <span className="ml-1 text-[10px] font-black text-rose-600 align-top">
                    ↺{wt.regressionCount}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Legend & Instruction Footer */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold">
              Speak aloud or tap words as you read. Backtracking logs ocular regressions.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="text-emerald-700">● Fluent</span>
            <span className="text-amber-700">● &gt;500ms Pause</span>
            <span className="text-rose-700">↺ Regression</span>
          </div>
        </div>
      </div>

      {/* Analysis Loading Indicator */}
      {isAnalyzing && (
        <div
          style={{
            backgroundColor: buddy.themeSurface,
            borderColor: buddy.themePrimary,
          }}
          className="rounded-3xl border-2 p-5 text-center space-y-3 animate-in fade-in"
        >
          <div className="w-full bg-white h-2.5 rounded-full overflow-hidden">
            <div
              style={{ backgroundColor: buddy.themePrimary }}
              className="h-full w-3/4 animate-pulse rounded-full"
            />
          </div>
          <p style={{ color: buddy.textColor }} className="text-xs sm:text-sm font-extrabold">
            {analysisStatus}
          </p>
        </div>
      )}

      {/* Primary Action Button */}
      {!isAnalyzing && !isCalibrating && (
        <div className="pt-1">
          <ClayButton
            text={
              isRecording
                ? 'Finish Reading & Run 17-Feature AI Screener ⭐'
                : 'Calibrate Gaze & Start Reading Quest 🚀'
            }
            onClick={() => {
              if (isRecording) {
                handleFinishReading();
              } else {
                if (!hasConsent) {
                  setShowConsentModal(true);
                } else {
                  beginGazeCalibration();
                }
              }
            }}
            color={isRecording ? '#059669' : buddy.themePrimary}
            shadowColor={isRecording ? '#064E3B' : buddy.themeShadow}
            fontSize={17}
            isExpanded={true}
          />
        </div>
      )}

      {/* Parental Consent Modal */}
      <ParentalConsentModal
        isOpen={showConsentModal}
        buddy={buddy}
        onConsentGranted={() => {
          setHasConsent(true);
          setShowConsentModal(false);
          beginGazeCalibration();
        }}
        onClose={() => setShowConsentModal(false)}
      />
    </div>
  );
};
