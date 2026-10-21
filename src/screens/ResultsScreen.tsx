import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Star,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Home,
  Brain,
  Award,
  Download,
  Eye,
  Mic,
  Sliders,
  RotateCcw,
  Activity,
  Layers,
} from 'lucide-react';
import { ClayButton } from '../components/ClayButton';
import { assessmentService } from '../services/assessmentService';
import { CLINICAL_FEATURE_NORMS } from '../services/multimodalEngine';
import { AssessmentResult, ChildProfile, ReadingBuddy } from '../types';

interface ResultsScreenProps {
  child: ChildProfile;
  buddy: ReadingBuddy;
  result: AssessmentResult;
  onGoToLearning: () => void;
  onReturnDashboard: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  child,
  buddy,
  result: initialResult,
  onGoToLearning,
  onReturnDashboard,
}) => {
  const [showClinicalView, setShowClinicalView] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [visualLayer, setVisualLayer] = useState<'saccades' | 'heatmap' | 'fluency'>('saccades');
  const [xaiTab, setXaiTab] = useState<'shap' | 'lime' | 'counterfactual'>('shap');
  const [showAll17Features, setShowAll17Features] = useState(false);

  // Counterfactual interactive state
  const [activeResult, setActiveResult] = useState<AssessmentResult>(initialResult);
  const [cfRegress, setCfRegress] = useState<number>(initialResult.features17.n_regress_trial);
  const [cfDwellSec, setCfDwellSec] = useState<number>(
    Math.round(initialResult.features17.dwell_time_trial / 1000)
  );
  const [cfFixDur, setCfFixDur] = useState<number>(initialResult.features17.mean_fix_dur_trial);
  const [cfHesitation, setCfHesitation] = useState<number>(
    initialResult.features17.speech_hesitation_rate
  );
  const [cfWorkMem, setCfWorkMem] = useState<number>(
    initialResult.features17.cognitive_working_memory
  );
  const [cfPhono, setCfPhono] = useState<number>(
    initialResult.features17.phonological_awareness_score
  );
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);

  useEffect(() => {
    setActiveResult(initialResult);
    setCfRegress(initialResult.features17.n_regress_trial);
    setCfDwellSec(Math.round(initialResult.features17.dwell_time_trial / 1000));
    setCfFixDur(initialResult.features17.mean_fix_dur_trial);
    setCfHesitation(initialResult.features17.speech_hesitation_rate);
    setCfWorkMem(initialResult.features17.cognitive_working_memory);
    setCfPhono(initialResult.features17.phonological_awareness_score);
  }, [initialResult]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.55 },
      });
    } catch (_) {
      // Ignore
    }
  }, []);

  const handleCounterfactualUpdate = (
    nextReg: number,
    nextDwellS: number,
    nextFix: number,
    nextHes: number,
    nextWm: number,
    nextPh: number
  ) => {
    setCfRegress(nextReg);
    setCfDwellSec(nextDwellS);
    setCfFixDur(nextFix);
    setCfHesitation(nextHes);
    setCfWorkMem(nextWm);
    setCfPhono(nextPh);

    const recomputed = assessmentService.recomputeCounterfactual(initialResult, {
      n_regress_trial: nextReg,
      dwell_time_trial: nextDwellS * 1000,
      mean_fix_dur_trial: nextFix,
      ratio_progress_regress_trial: Number((51 / Math.max(1, nextReg)).toFixed(2)),
      speech_hesitation_rate: nextHes,
      speech_phoneme_stability: Number(
        Math.min(0.95, Math.max(0.28, 0.92 - nextHes * 0.11)).toFixed(2)
      ),
      cognitive_working_memory: nextWm,
      phonological_awareness_score: nextPh,
    });
    setActiveResult(recomputed);
  };

  const resetCounterfactual = () => {
    setActiveResult(initialResult);
    setCfRegress(initialResult.features17.n_regress_trial);
    setCfDwellSec(Math.round(initialResult.features17.dwell_time_trial / 1000));
    setCfFixDur(initialResult.features17.mean_fix_dur_trial);
    setCfHesitation(initialResult.features17.speech_hesitation_rate);
    setCfWorkMem(initialResult.features17.cognitive_working_memory);
    setCfPhono(initialResult.features17.phonological_awareness_score);
  };

  const isHighRisk = activeResult.riskProbability >= 0.68;
  const isModerateRisk =
    activeResult.riskProbability >= 0.38 && activeResult.riskProbability < 0.68;
  const statusColor = isHighRisk
    ? '#E11D48'
    : isModerateRisk
    ? '#D97706'
    : '#059669';

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      assessmentService.generatePdfReport(child, activeResult);
      setDownloading(false);
    }, 300);
  };

  const featureLabels: Record<string, string> = {
    n_regress_trial: 'Ocular Regressions (Backward Saccades)',
    speech_hesitation_rate: 'Acoustic Hesitations (>500ms Pauses)',
    phonological_awareness_score: 'Phonological Sound-Blending Accuracy',
    dwell_time_trial: 'Total Passage Fixation Dwell Time',
    speech_phoneme_stability: 'Acoustic Phoneme Decoding Stability',
    cognitive_working_memory: 'Visual & Auditory Working Memory',
    mean_fix_dur_trial: 'Mean Single Fixation Duration',
    ratio_progress_regress_trial: 'Progressive-to-Regressive Saccade Ratio',
    mean_sacc_ampl_trial: 'Mean Saccadic Amplitude',
    gaze_emb_0: '1D-CNN+BiLSTM Emb 0 (Forward Sweep Regularity)',
    gaze_emb_1: '1D-CNN+BiLSTM Emb 1 (Regressive Burst Density)',
    gaze_emb_2: '1D-CNN+BiLSTM Emb 2 (Fixation Tail Kurtosis)',
    gaze_emb_3: '1D-CNN+BiLSTM Emb 3 (Saccadic Fragmentation)',
    gaze_emb_4: '1D-CNN+BiLSTM Emb 4 (Ocular Velocity Dispersion)',
    gaze_emb_5: '1D-CNN+BiLSTM Emb 5 (Bilateral Temporal Divergence)',
    gaze_emb_6: '1D-CNN+BiLSTM Emb 6 (Complex Word Attention Weight)',
    gaze_emb_7: '1D-CNN+BiLSTM Emb 7 (Sequence Risk Logit)',
  };

  const shapSource = showAll17Features
    ? activeResult.all17Shap
    : activeResult.featureContributionsShap;
  const sortedShap = Object.entries(shapSource || {}).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );

  const words = activeResult.wordTelemetry || [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Dual-Mode Toggle: Kid Champion vs Parent & Specialist */}
      <div
        style={{
          backgroundColor: buddy.themeSurface,
          borderColor: `${buddy.themePrimary}44`,
        }}
        className="p-1.5 rounded-2xl border-2 flex items-center gap-1.5 shadow-xs"
      >
        <button
          onClick={() => setShowClinicalView(false)}
          style={{
            backgroundColor: !showClinicalView ? buddy.themePrimary : 'transparent',
            color: !showClinicalView ? '#FFFFFF' : buddy.textColor,
          }}
          className="flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{buddy.emoji}</span>
          <span>Kid Champion Mode</span>
        </button>

        <button
          onClick={() => setShowClinicalView(true)}
          style={{
            backgroundColor: showClinicalView ? '#1E1B4B' : 'transparent',
            color: showClinicalView ? '#FFFFFF' : buddy.textColor,
          }}
          className="flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Brain className="w-4 h-4" />
          <span>Parent &amp; Specialist Clinical XAI</span>
        </button>
      </div>

      {!showClinicalView ? (
        /* ==========================================
           KID CHAMPION VIEW (Zero Anxiety, High Fun)
           ========================================== */
        <div className="space-y-5">
          <div
            style={{
              borderColor: buddy.themePrimary,
              boxShadow: `0 8px 0 0 ${buddy.themeShadow}, 0 16px 26px ${buddy.themeShadow}20`,
            }}
            className="bg-white rounded-3xl border-3 p-6 sm:p-8 text-center space-y-4"
          >
            <div className="flex justify-center">
              <div
                style={{
                  backgroundColor: buddy.themeSurface,
                  borderColor: buddy.themeSecondary,
                }}
                className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl shadow-md"
              >
                {buddy.emoji}
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
              Quest Completed, {child.name}! 🎉
            </h2>

            <p
              style={{ color: buddy.textColor }}
              className="text-xs sm:text-sm font-semibold italic max-w-md mx-auto"
            >
              &ldquo;{buddy.cheerQuote}&rdquo;
            </p>

            <div className="flex items-center justify-center gap-1 text-amber-400 py-1">
              <Star className="w-10 h-10 fill-amber-400 stroke-amber-500" />
              <Star className="w-14 h-14 fill-amber-400 stroke-amber-500 -translate-y-1" />
              <Star className="w-10 h-10 fill-amber-400 stroke-amber-500" />
            </div>

            <div className="text-sm font-black text-amber-800">
              Earned +150 Reader EXP · {activeResult.readingSpeedWpm} WPM Reading Speed
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-[#1E1B4B] mb-2.5">
              Superpowers Unlocked Today ⚡
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                style={{
                  backgroundColor: buddy.themeSurface,
                  borderColor: `${buddy.themePrimary}44`,
                }}
                className="rounded-2xl border p-4 text-center"
              >
                <span className="text-2xl block mb-1">👀</span>
                <h4 style={{ color: buddy.themePrimary }} className="font-black text-xs">
                  Ocular Explorer
                </h4>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  Tracked {words.length} story words
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-center">
                <span className="text-2xl block mb-1">🎤</span>
                <h4 className="font-black text-xs text-emerald-800">Voice Hero</h4>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  {activeResult.wordAccuracyPct}% Word Accuracy
                </p>
              </div>

              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-center">
                <span className="text-2xl block mb-1">🧠</span>
                <h4 className="font-black text-xs text-amber-800">Memory Star</h4>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  {activeResult.features17.cognitive_working_memory} pts Memory Power
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ClayButton
              text="Play Personalized Daily Practice Activities 🎮"
              onClick={onGoToLearning}
              color={buddy.themeSecondary}
              shadowColor={buddy.themeShadow}
              textColor="#1E1B4B"
              fontSize={16}
              isExpanded={true}
            />
          </div>
        </div>
      ) : (
        /* ==========================================
           PARENT & SPECIALIST CLINICAL XAI VIEW
           ========================================== */
        <div className="space-y-5 animate-in fade-in">
          {/* 1. Child Header & Verification Metadata */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div
                style={{ backgroundColor: `${buddy.themePrimary}18` }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-[#1E1B4B]"
              >
                {child.name[0] || 'C'}
              </div>
              <div>
                <h3 className="font-black text-[#1E1B4B] text-base">{child.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <span>{child.grade}</span>
                  <span>·</span>
                  <span>Age {child.age}</span>
                  <span>·</span>
                  <span>
                    {activeResult.presetName
                      ? `Preset: ${activeResult.presetName}`
                      : 'Live Tri-Modal Sensor Trial'}
                  </span>
                </div>
              </div>
            </div>

            <ClayButton
              text={downloading ? 'Generating PDF...' : 'Download Clinical PDF 📄'}
              onClick={handleDownloadPdf}
              disabled={downloading}
              color="#1E1B4B"
              shadowColor="#000000"
              textColor="#FFFFFF"
              depth={4}
              fontSize={13}
              icon={<Download className="w-4 h-4 text-amber-300" />}
            />
          </div>

          {/* 2. Tri-Modal Risk Indicator & Sub-Scores */}
          <div
            style={{
              backgroundColor: `${statusColor}0B`,
              borderColor: statusColor,
            }}
            className="rounded-3xl border-2 p-5 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isHighRisk ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  ) : isModerateRisk ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  <span
                    style={{ color: statusColor }}
                    className="font-black text-sm uppercase tracking-wider"
                  >
                    {activeResult.screeningLevel}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  17-Feature Two-Stage Hybrid Screener · Model Confidence:{' '}
                  <strong className="tabular-nums">
                    {(activeResult.confidenceScore * 100).toFixed(0)}%
                  </strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div
                  style={{ color: statusColor }}
                  className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums"
                >
                  {(activeResult.riskProbability * 100).toFixed(1)}%
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Dyslexia Risk Probability
                </span>
              </div>
            </div>

            {/* 3 Modality Sub-Score Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
              {[
                {
                  title: '1. Ocular Gaze Layer',
                  score: activeResult.modalitySubScores.ocularRisk,
                  detail: `${activeResult.features17.n_regress_trial} regressions · ${activeResult.features17.mean_fix_dur_trial}ms fix`,
                },
                {
                  title: '2. Acoustic Speech Layer',
                  score: activeResult.modalitySubScores.acousticRisk,
                  detail: `${activeResult.features17.speech_hesitation_rate}/min pauses · ${activeResult.readingSpeedWpm} WPM`,
                },
                {
                  title: '3. Cognitive & Phonology',
                  score: activeResult.modalitySubScores.cognitiveRisk,
                  detail: `Memory ${activeResult.features17.cognitive_working_memory} · Blending ${activeResult.features17.phonological_awareness_score}`,
                },
              ].map((m) => {
                const mHigh = m.score >= 0.65;
                const mMod = m.score >= 0.38 && m.score < 0.65;
                const mColor = mHigh ? '#E11D48' : mMod ? '#D97706' : '#059669';
                return (
                  <div
                    key={m.title}
                    className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#1E1B4B]">{m.title}</span>
                      <span style={{ color: mColor }} className="font-black">
                        {(m.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(8, m.score * 100))}%`,
                          backgroundColor: mColor,
                        }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500">{m.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-2xl bg-white/90 border border-slate-200 text-[11px] italic text-slate-600 text-center">
              {activeResult.disclaimer}
            </div>
          </div>

          {/* 3. Novelty Visualizer: Gaze Heatmap, Saccade Trajectory & Word Fluency Map */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-[#1E1B4B] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  <span>Ocular Gaze Heatmap, Saccade Trajectory &amp; Oral Fluency Map</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Visualizes forward progressive fixations, backward regressive jumps, and word-level speech decoding over the passage.
                </p>
              </div>

              {/* Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
                {[
                  { id: 'saccades', label: 'Saccade Vectors' },
                  { id: 'heatmap', label: 'Fixation Heatmap' },
                  { id: 'fluency', label: 'Word Fluency' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setVisualLayer(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      visualLayer === tab.id
                        ? 'bg-white text-[#1E1B4B] shadow-xs'
                        : 'text-slate-600 hover:text-[#1E1B4B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Passage & SVG Saccade/Heatmap Canvas */}
            <div className="bg-[#FFFDF5] rounded-2xl border border-slate-200 p-4 relative">
              {visualLayer !== 'fluency' ? (
                <div className="space-y-3">
                  <svg
                    viewBox="0 0 760 260"
                    className="w-full h-auto rounded-xl bg-[#FFFDF5] border border-slate-200/70"
                  >
                    {/* Render 5 lines of passage words with exact coordinates */}
                    {words.map((wt, idx) => {
                      const lineIdx = Math.floor(idx / 10);
                      const colIdx = idx % 10;
                      const cx = 52 + colIdx * 72;
                      const cy = 42 + lineIdx * 48;
                      const dwellRadius = Math.min(24, Math.max(8, wt.dwellMs / 48));
                      const isReg = wt.regressionCount > 0 || wt.status === 'regressed';
                      const isHes = wt.status === 'hesitated';

                      return (
                        <g
                          key={idx}
                          onClick={() => setSelectedWordIdx(idx)}
                          className="cursor-pointer"
                        >
                          {/* Thermal fixation circle */}
                          <circle
                            cx={cx}
                            cy={cy - 4}
                            r={dwellRadius}
                            fill={
                              isReg
                                ? 'rgba(225, 29, 72, 0.24)'
                                : isHes
                                ? 'rgba(245, 158, 11, 0.24)'
                                : 'rgba(2, 132, 199, 0.16)'
                            }
                            stroke={
                              isReg
                                ? '#E11D48'
                                : isHes
                                ? '#D97706'
                                : '#0284C7'
                            }
                            strokeWidth={isReg ? 2 : 1}
                          />

                          {/* Forward saccade line to next word on same line */}
                          {visualLayer === 'saccades' && colIdx < 9 && idx + 1 < words.length && (
                            <line
                              x1={cx + 12}
                              y1={cy - 4}
                              x2={cx + 60}
                              y2={cy - 4}
                              stroke="rgba(2, 132, 199, 0.35)"
                              strokeWidth="1.5"
                            />
                          )}

                          {/* Backward Regressive Saccade Arc if regression occurred */}
                          {visualLayer === 'saccades' && isReg && colIdx > 0 && (
                            <path
                              d={`M ${cx} ${cy - 12} Q ${cx - 36} ${cy - 34} ${cx - 72} ${cy - 12}`}
                              fill="none"
                              stroke="#E11D48"
                              strokeWidth="2.2"
                              strokeDasharray="3 2"
                            />
                          )}

                          {/* Word label */}
                          <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight={isReg ? '800' : '600'}
                            fill="#1E1B4B"
                          >
                            {wt.word}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
                    <div className="flex items-center gap-4">
                      <span className="text-sky-700">◯ Forward Fixation (radius = dwell ms)</span>
                      <span className="text-amber-700">◯ &gt;500ms Decoding Pause</span>
                      <span className="text-rose-600">↶ Dashed Arc = Backward Ocular Regression</span>
                    </div>
                    <span className="text-slate-400">Click any word node to inspect telemetry</span>
                  </div>
                </div>
              ) : (
                /* Word-by-Word Oral Fluency & Pronunciation View */
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {words.map((wt, i) => {
                      const bg =
                        wt.status === 'mispronounced'
                          ? 'bg-rose-100 border-rose-400 text-rose-950'
                          : wt.status === 'regressed'
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : wt.status === 'hesitated'
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950';

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedWordIdx(i)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${bg}`}
                        >
                          <span>{wt.word}</span>
                          <span className="ml-1.5 text-[10px] opacity-75 tabular-nums">
                            {wt.dwellMs}ms
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Word Inspection Bar */}
              {selectedWordIdx !== null && words[selectedWordIdx] && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
                  <div>
                    <strong className="text-[#1E1B4B]">
                      Word #{selectedWordIdx + 1}: &ldquo;{words[selectedWordIdx].word}&rdquo;
                    </strong>{' '}
                    <span className="text-slate-500">
                      · Status: {words[selectedWordIdx].status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-bold text-slate-700">
                    <span>Dwell: {words[selectedWordIdx].dwellMs}ms</span>
                    <span>·</span>
                    <span>Regressions: {words[selectedWordIdx].regressionCount}</span>
                    <span>·</span>
                    <span>
                      Phonetic Confidence:{' '}
                      {(words[selectedWordIdx].pronunciationConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Dual Explainable AI (XAI) Suite: Tree SHAP + LIME + Counterfactual Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-[#1E1B4B] flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#1E1B4B]" />
                  <span>Glass-Box Explainable AI (Tree SHAP &amp; Local LIME)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Deconstructs the mathematical contribution of each biomarker and tests counterfactual interventions.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
                {[
                  { id: 'shap', label: 'Tree SHAP' },
                  { id: 'lime', label: 'Case LIME' },
                  { id: 'counterfactual', label: 'What-If Simulator' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setXaiTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      xaiTab === t.id
                        ? 'bg-white text-[#1E1B4B] shadow-xs'
                        : 'text-slate-600 hover:text-[#1E1B4B]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {xaiTab === 'shap' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs tabular-nums">
                  <div>
                    <span className="font-bold text-slate-600">SHAP Additive Identity: </span>
                    <strong className="text-[#1E1B4B]">
                      Base Prior ({(activeResult.baseValueShap * 100).toFixed(1)}%) + ∑ φ_i ={' '}
                      {(activeResult.riskProbability * 100).toFixed(1)}% Risk
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAll17Features((prev) => !prev)}
                    className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {showAll17Features
                      ? 'Show 9 Grouped Clinical Biometrics'
                      : 'Show All 17 Features (incl. 8 CNN-BiLSTM Gaze Embeddings)'}
                  </button>
                </div>

                <div className="space-y-3 tabular-nums">
                  {sortedShap.map(([key, val]) => {
                    const label = featureLabels[key] || key;
                    const isRisk = val > 0;
                    const barColor = isRisk ? '#E11D48' : '#059669';
                    const sign = isRisk ? '+' : '';
                    const pct = `${sign}${(val * 100).toFixed(1)}%`;
                    const progressWidth = Math.min(100, Math.max(6, Math.abs(val) * 380));
                    const rawVal =
                      activeResult.features17[key as keyof typeof activeResult.features17];

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="truncate">
                            <span className="font-bold text-[#1E1B4B]">{label}</span>
                            {rawVal !== undefined && (
                              <span className="ml-2 text-[11px] text-slate-400 font-semibold">
                                [val: {rawVal}]
                              </span>
                            )}
                          </div>
                          <span style={{ color: barColor }} className="font-black shrink-0">
                            {pct} {isRisk ? '▲ Risk' : '▼ Protective'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${progressWidth}%`,
                              backgroundColor: barColor,
                            }}
                            className="h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {xaiTab === 'lime' && (
              <div className="space-y-4 tabular-nums">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-600">
                      Local Ridge Surrogate Fit (150 Perturbations):{' '}
                    </span>
                    <strong className="text-[#1E1B4B]">
                      R² = {activeResult.limeExplanation.rSquared}
                    </strong>
                  </div>
                  <div className="font-bold text-slate-700">
                    LIME Local Estimate:{' '}
                    <strong>{(activeResult.limeExplanation.localPrediction * 100).toFixed(1)}%</strong>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {activeResult.limeExplanation.rules.map((rule) => {
                    const isRisk = rule.weight > 0;
                    const barColor = isRisk ? '#E11D48' : '#059669';
                    const sign = isRisk ? '+' : '';
                    return (
                      <div
                        key={rule.feature}
                        className="p-3 rounded-2xl border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-black text-[#1E1B4B]">{rule.label}</span>
                            <span className="ml-2 font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {rule.condition}
                            </span>
                          </div>
                          <span style={{ color: barColor }} className="font-black">
                            {sign}
                            {(rule.weight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>Measured: {rule.measuredValue}</span>
                          <span>{rule.normativeRange}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {xaiTab === 'counterfactual' && (
              <div className="space-y-4 tabular-nums">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
                  <span className="font-bold text-indigo-950">
                    Drag sliders to simulate biometric improvements and verify real-time 17-feature model sensitivity:
                  </span>
                  <button
                    type="button"
                    onClick={resetCounterfactual}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-black hover:bg-indigo-100 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Ocular Regressions (n_regress)</span>
                      <span className="text-indigo-700 font-black">{cfRegress} jumps</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={38}
                      step={1}
                      value={cfRegress}
                      onChange={(e) =>
                        handleCounterfactualUpdate(
                          Number(e.target.value),
                          cfDwellSec,
                          cfFixDur,
                          cfHesitation,
                          cfWorkMem,
                          cfPhono
                        )
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      ETDD70 Typical: 4–12 | Dyslexic: 18–36
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Speech Hesitations (&gt;500ms)</span>
                      <span className="text-indigo-700 font-black">{cfHesitation} /min</span>
                    </div>
                    <input
                      type="range"
                      min={0.4}
                      max={7.0}
                      step={0.2}
                      value={cfHesitation}
                      onChange={(e) =>
                        handleCounterfactualUpdate(
                          cfRegress,
                          cfDwellSec,
                          cfFixDur,
                          Number(e.target.value),
                          cfWorkMem,
                          cfPhono
                        )
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Typical: 0.5–2.2/min | Elevated: &gt;2.6/min
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Passage Dwell Time</span>
                      <span className="text-indigo-700 font-black">{cfDwellSec} sec</span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={110}
                      step={2}
                      value={cfDwellSec}
                      onChange={(e) =>
                        handleCounterfactualUpdate(
                          cfRegress,
                          Number(e.target.value),
                          cfFixDur,
                          cfHesitation,
                          cfWorkMem,
                          cfPhono
                        )
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Typical: 22–42s | Elevated: &gt;48s
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Mean Fixation Duration</span>
                      <span className="text-indigo-700 font-black">{cfFixDur} ms</span>
                    </div>
                    <input
                      type="range"
                      min={170}
                      max={520}
                      step={10}
                      value={cfFixDur}
                      onChange={(e) =>
                        handleCounterfactualUpdate(
                          cfRegress,
                          cfDwellSec,
                          Number(e.target.value),
                          cfHesitation,
                          cfWorkMem,
                          cfPhono
                        )
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      ETDD70 Typical: 190–290ms | Elevated: &gt;320ms
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Phonological Sound Blending</span>
                      <span className="text-indigo-700 font-black">{cfPhono} pts</span>
                    </div>
                    <input
                      type="range"
                      min={35}
                      max={98}
                      step={1}
                      value={cfPhono}
                      onChange={(e) =>
                        handleCounterfactualUpdate(
                          cfRegress,
                          cfDwellSec,
                          cfFixDur,
                          cfHesitation,
                          cfWorkMem,
                          Number(e.target.value)
                        )
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Typical: 76–98 pts | Elevated Risk: &lt;72 pts
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Cognitive Working Memory</span>
                      <span className="text-indigo-700 font-black">{cfWorkMem} pts</span>
                    </div>
                    <input
                      type="range"
                      min={35}
                      max={98}
                      step={1}
                      value={cfWorkMem}
                      onChange={(e) =>
                        handleCounterfactualUpdate(
                          cfRegress,
                          cfDwellSec,
                          cfFixDur,
                          cfHesitation,
                          Number(e.target.value),
                          cfPhono
                        )
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Typical: 75–98 pts | Elevated Risk: &lt;70 pts
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Targeted Remediation Plan */}
          {activeResult.personalizedLearningPlan && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award style={{ color: buddy.themePrimary }} className="w-5 h-5" />
                  <h3 className="font-black text-base text-[#1E1B4B]">
                    Targeted Multimodal Remediation Plan
                  </h3>
                </div>
                {activeResult.personalizedLearningPlan.weekly_schedule && (
                  <span className="text-xs font-bold text-slate-500">
                    {activeResult.personalizedLearningPlan.weekly_schedule}
                  </span>
                )}
              </div>

              {activeResult.personalizedLearningPlan.primary_focus && (
                <div
                  style={{
                    backgroundColor: buddy.themeSurface,
                    color: buddy.textColor,
                  }}
                  className="p-3 rounded-2xl text-xs font-extrabold"
                >
                  Primary Clinical Focus: {activeResult.personalizedLearningPlan.primary_focus}
                </div>
              )}

              {Array.isArray(activeResult.personalizedLearningPlan.recommended_activities) && (
                <ul className="space-y-2 text-xs text-slate-700 font-semibold pl-1">
                  {activeResult.personalizedLearningPlan.recommended_activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-black">•</span>
                      <span>{String(act)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Return to Dashboard */}
      <div className="text-center pt-2">
        <button
          onClick={onReturnDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1E1B4B] transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Parent Dashboard</span>
        </button>
      </div>
    </div>
  );
};
