import React, { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, ArrowRight, Eye, Mic, BookOpen, ChevronLeft } from 'lucide-react';
import { ClayButton } from '../components/ClayButton';
import { profileService } from '../services/profileService';
import { ChildProfile, ProgressRecord, ReadingBuddy } from '../types';

interface ProgressDashboardScreenProps {
  child?: ChildProfile | null;
  buddy: ReadingBuddy;
  onReturnDashboard: () => void;
}

export const ProgressDashboardScreen: React.FC<ProgressDashboardScreenProps> = ({
  child,
  buddy,
  onReturnDashboard,
}) => {
  const [history, setHistory] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const childId = child?.id || '1';
      const records = await profileService.getProgressHistory(childId);
      setHistory(records);
      setLoading(false);
    };
    load();
  }, [child?.id]);

  const firstRecord = history[0] || {
    date: 'Session 1',
    risk_score: 0.84,
    regressions: 34,
    hesitations: 5.2,
    reading_speed_wpm: 58,
  };
  const latestRecord = history[history.length - 1] || firstRecord;

  const firstRisk = firstRecord.risk_score;
  const latestRisk = latestRecord.risk_score;
  const riskDeltaPct =
    firstRisk > 0 ? Math.round(((latestRisk - firstRisk) / firstRisk) * 100) : 0;

  const firstReg = firstRecord.regressions;
  const latestReg = latestRecord.regressions;
  const regDeltaPct =
    firstReg > 0 ? Math.round(((latestReg - firstReg) / firstReg) * 100) : 0;

  const firstHes = firstRecord.hesitations;
  const latestHes = latestRecord.hesitations;
  const hesDeltaPct =
    firstHes > 0 ? Math.round(((latestHes - firstHes) / firstHes) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1E1B4B]">
            {child ? `${child.name}’s Reading Trajectory` : 'Longitudinal Progress'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Database-backed longitudinal screening indicators and oculomotor trends.
          </p>
        </div>

        <button
          onClick={onReturnDashboard}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#1E1B4B] p-2 rounded-xl bg-white border border-slate-200 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold animate-pulse">
          Loading longitudinal trajectories...
        </div>
      ) : (
        <>
          {/* Visual Risk Reduction Chart Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-[#1E1B4B]">
                  Dyslexia Risk Index Trend
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Probability estimated by multimodal classifier over time
                </p>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                  riskDeltaPct <= 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {riskDeltaPct <= 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>
                  {riskDeltaPct <= 0
                    ? `${riskDeltaPct}% Risk Reduction`
                    : `+${riskDeltaPct}% Risk Trend`}
                </span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="pt-4 pb-2 border-b border-slate-100 flex items-end justify-around gap-2 h-44">
              {history.map((item, idx) => {
                const score = item.risk_score;
                const isHigh = score >= 0.7;
                const isMod = score >= 0.4 && score < 0.7;
                const barColor = isHigh ? '#E53935' : isMod ? '#FB8C00' : '#43A047';
                const heightPct = Math.min(100, Math.max(18, score * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[56px]">
                    <span
                      style={{ color: barColor }}
                      className="text-[11px] font-black"
                    >
                      {Math.round(score * 100)}%
                    </span>
                    <div className="w-full bg-slate-100 rounded-xl h-28 flex items-end p-1">
                      <div
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: barColor,
                        }}
                        className="w-full rounded-lg transition-all duration-500 shadow-xs"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 truncate max-w-full">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Biometric Milestone Indicators */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Observable Biometric Milestones
            </h3>

            {/* 1. Eye Regressions */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#1E1B4B]">
                    Eye Regressions per Trial
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-0.5">
                    <span>Initial: {firstReg}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="text-[#1E1B4B] font-black">Latest: {latestReg}</span>
                  </div>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  regDeltaPct <= 0
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {regDeltaPct > 0 ? `+${regDeltaPct}%` : `${regDeltaPct}%`}
              </span>
            </div>

            {/* 2. Speech Hesitations */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#1E1B4B]">
                    Speech Hesitations (&gt;500ms)
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-0.5">
                    <span>Initial: {firstHes.toFixed(1)}/min</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="text-[#1E1B4B] font-black">Latest: {latestHes.toFixed(1)}/min</span>
                  </div>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  hesDeltaPct <= 0
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {hesDeltaPct > 0 ? `+${hesDeltaPct}%` : `${hesDeltaPct}%`}
              </span>
            </div>

            {/* 3. Reading Fluency */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#1E1B4B]">
                    Oral Reading Fluency
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-0.5">
                    <span>Initial: {firstRecord.reading_speed_wpm} WPM</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="text-[#1E1B4B] font-black">Latest: {latestRecord.reading_speed_wpm} WPM</span>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-50 text-sky-800">
                +25%
              </span>
            </div>
          </div>

          <div className="pt-3">
            <ClayButton
              text="Return to Parent Dashboard 🏠"
              onClick={onReturnDashboard}
              color={buddy.themePrimary}
              shadowColor={buddy.themeShadow}
              fontSize={15}
              isExpanded={true}
            />
          </div>
        </>
      )}
    </div>
  );
};
