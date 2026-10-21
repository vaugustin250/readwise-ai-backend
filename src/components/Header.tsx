import React from 'react';
import { LineChart, LogOut, Radio } from 'lucide-react';
import { ReadingBuddy, ChildProfile } from '../types';

interface HeaderProps {
  title: string;
  buddy: ReadingBuddy;
  activeChild?: ChildProfile | null;
  sensorsLive?: boolean;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  buddy,
  activeChild,
  sensorsLive = true,
  onNavigate,
  onLogout,
  showBack = false,
  onBack,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF5]/95 backdrop-blur-xs border-b border-amber-900/10 px-4 py-2.5 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Back or Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-[#1E1B4B] hover:bg-slate-50 transition-colors shadow-xs"
              title="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-2xl select-none group-hover:scale-110 transition-transform">📖</span>
              <span className="font-extrabold text-base sm:text-lg text-[#1E1B4B] tracking-tight">
                ReadWise <span style={{ color: buddy.themePrimary }}>AI</span>
              </span>
            </div>
          )}

          {activeChild && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200/80">
              <span>👤 {activeChild.name}</span>
              <span className="text-amber-600 font-normal">({activeChild.grade})</span>
            </span>
          )}
        </div>

        {/* Center: Title on larger screens */}
        <div className="hidden md:block text-center truncate">
          <span className="font-black text-sm text-[#1E1B4B]">{title}</span>
        </div>

        {/* Right: Buddy Chip, Sensors Pill, Progress, Logout */}
        <div className="flex items-center gap-2">
          {/* Sensors Indicator */}
          <div
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              sensorsLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <Radio className={`w-3 h-3 ${sensorsLive ? 'animate-pulse text-emerald-600' : 'text-rose-500'}`} />
            <span>{sensorsLive ? 'Sensors Live' : 'Initializing'}</span>
          </div>

          {/* Reading Buddy Avatar Button */}
          <button
            onClick={() => onNavigate('buddy_select')}
            style={{
              backgroundColor: buddy.themeSurface,
              borderColor: `${buddy.themePrimary}66`,
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl border text-xs font-extrabold hover:brightness-95 transition-all shadow-xs"
            title={`Active Companion: ${buddy.name} (${buddy.badge})`}
          >
            <span className="text-sm">{buddy.emoji}</span>
            <span style={{ color: buddy.textColor }} className="hidden sm:inline">
              {buddy.name}
            </span>
          </button>

          {/* Trajectory shortcut */}
          <button
            onClick={() => onNavigate('progress')}
            className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-xs"
            title="Longitudinal Progress Dashboard"
          >
            <LineChart className="w-4 h-4" />
          </button>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
