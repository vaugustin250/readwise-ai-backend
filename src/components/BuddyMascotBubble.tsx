import React from 'react';
import { ReadingBuddy } from '../types';

interface BuddyMascotBubbleProps {
  buddy: ReadingBuddy;
  message?: string;
  onBuddyTap?: () => void;
  className?: string;
}

export const BuddyMascotBubble: React.FC<BuddyMascotBubbleProps> = ({
  buddy,
  message,
  onBuddyTap,
  className = '',
}) => {
  const displayMsg = message || `${buddy.name}: "${buddy.tagline}"`;

  return (
    <div
      onClick={onBuddyTap}
      style={{
        backgroundColor: buddy.themeSurface,
        borderColor: `${buddy.themePrimary}55`,
        boxShadow: `0 4px 14px ${buddy.themeShadow}22`,
      }}
      className={`rounded-2xl border-2 p-3 sm:p-4 flex items-center gap-3.5 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${className}`}
      title="Click to switch your Reading Buddy!"
    >
      {/* 3D Buddy Avatar Orb */}
      <div
        style={{
          borderColor: buddy.themePrimary,
          backgroundColor: '#FFFFFF',
          boxShadow: `0 3px 8px ${buddy.themeShadow}44`,
        }}
        className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center text-2xl sm:text-3xl select-none"
      >
        <span>{buddy.emoji}</span>
        <span className="absolute -bottom-1 -right-1 bg-amber-400 text-[9px] font-black text-amber-950 px-1 py-0.5 rounded-full border border-white">
          LVL 1
        </span>
      </div>

      {/* Speech text bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            style={{ color: buddy.themePrimary }}
            className="text-xs font-black tracking-wider uppercase truncate"
          >
            {buddy.name} • {buddy.badge}
          </span>
          <span className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white/70 px-1.5 py-0.5 rounded-md border border-slate-200">
            Switch ⇄
          </span>
        </div>
        <p
          style={{ color: buddy.textColor }}
          className="text-xs sm:text-sm font-semibold leading-snug line-clamp-2"
        >
          {displayMsg}
        </p>
      </div>
    </div>
  );
};
