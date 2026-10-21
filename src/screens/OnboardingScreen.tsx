import React from 'react';
import { ClayButton } from '../components/ClayButton';
import { ReadingBuddy } from '../types';

interface OnboardingScreenProps {
  buddy: ReadingBuddy;
  onGetStarted: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  buddy,
  onGetStarted,
}) => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col justify-between p-6 max-w-md mx-auto text-center">
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        {/* Big tactile illustration avatar */}
        <div
          style={{
            backgroundColor: `${buddy.themePrimary}18`,
            borderColor: `${buddy.themePrimary}33`,
            boxShadow: `0 12px 30px ${buddy.themeShadow}25`,
          }}
          className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 flex flex-col items-center justify-center mb-8 relative transition-transform hover:scale-105 duration-300"
        >
          <span className="text-6xl sm:text-7xl mb-2 select-none">{buddy.emoji}</span>
          <span className="text-3xl">📖✨</span>

          <span
            style={{
              backgroundColor: buddy.themeSecondary,
              color: '#1E1B4B',
            }}
            className="absolute -bottom-2 font-black text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider"
          >
            {buddy.badge}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#1E1B4B] tracking-tight leading-tight">
          Welcome to <br />
          <span style={{ color: buddy.themePrimary }}>ReadWise AI</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium max-w-sm leading-relaxed">
          Early screening and personalized reading support for children, powered by multimodal explainable AI.
        </p>

        {/* Feature badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xs">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
            👀 Gaze Tracking
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
            🎤 Speech Telemetry
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
            🎮 Hero Buddies
          </span>
        </div>
      </div>

      <div className="pb-6">
        <ClayButton
          text="Get Started 🚀"
          onClick={onGetStarted}
          color={buddy.themePrimary}
          shadowColor={buddy.themeShadow}
          fontSize={18}
          isExpanded={true}
        />
        <p className="text-[11px] text-slate-400 font-semibold mt-3">
          Dyslexia-conscious typeface & low-glare canvas designed for stress-free reading.
        </p>
      </div>
    </div>
  );
};
