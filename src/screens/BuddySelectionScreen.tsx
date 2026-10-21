import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Zap, Quote } from 'lucide-react';
import { ClayButton } from '../components/ClayButton';
import { ALL_BUDDIES } from '../data/buddies';
import { ReadingBuddy } from '../types';

interface BuddySelectionScreenProps {
  currentBuddy: ReadingBuddy;
  onSelectBuddy: (buddy: ReadingBuddy) => void;
  onBack: () => void;
}

export const BuddySelectionScreen: React.FC<BuddySelectionScreenProps> = ({
  currentBuddy,
  onSelectBuddy,
  onBack,
}) => {
  const [selectedBuddy, setSelectedBuddy] = useState<ReadingBuddy>(currentBuddy);

  const handleConfirm = () => {
    onSelectBuddy(selectedBuddy);
    onBack();
  };

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${selectedBuddy.themeSurface} 0%, #FFFDF5 100%)`,
      }}
      className="min-h-screen p-4 sm:p-6 transition-colors duration-300 flex flex-col justify-between max-w-4xl mx-auto"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-full bg-white border border-slate-200 text-[#1E1B4B] shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span
              style={{ color: selectedBuddy.themePrimary }}
              className="text-[11px] font-black tracking-widest uppercase"
            >
              READING BUDDIES
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">
              Choose Your Hero
            </h1>
          </div>

          <div className="w-10" />
        </div>

        <p className="text-xs sm:text-sm text-center text-slate-600 font-medium mb-6">
          Choose a reading companion who guides your gaze, cheers on tricky words, and gives superpower boosts!
        </p>

        {/* Hero selection cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {ALL_BUDDIES.map((b) => {
            const isSelected = b.id === selectedBuddy.id;

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBuddy(b)}
                style={{
                  borderColor: isSelected ? b.themePrimary : '#E2E8F0',
                  boxShadow: isSelected
                    ? `0 8px 0 0 ${b.themeShadow}, 0 16px 24px ${b.themeShadow}25`
                    : '0 4px 10px rgba(0,0,0,0.04)',
                }}
                className={`bg-white rounded-3xl border-3 p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected ? 'scale-[1.02] ring-2 ring-amber-300' : 'hover:scale-[1.01]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      style={{
                        backgroundColor: `${b.themePrimary}18`,
                        color: b.themePrimary,
                      }}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
                    >
                      {b.badge}
                    </span>

                    {isSelected && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Active Hero
                      </span>
                    )}
                  </div>

                  {/* Avatar Halo */}
                  <div className="flex flex-col items-center text-center my-2">
                    <div
                      style={{
                        backgroundColor: b.themeSurface,
                        borderColor: b.themePrimary,
                        boxShadow: `0 6px 16px ${b.themeShadow}33`,
                      }}
                      className="w-20 h-20 rounded-full border-3 flex items-center justify-center text-4xl mb-3"
                    >
                      {b.emoji}
                    </div>

                    <h3
                      style={{ color: b.textColor }}
                      className="text-lg font-black tracking-tight"
                    >
                      {b.name}
                    </h3>
                    <span
                      style={{ color: b.themePrimary }}
                      className="text-xs font-bold"
                    >
                      {b.series}
                    </span>
                  </div>

                  {/* Superpower box */}
                  <div
                    style={{
                      backgroundColor: b.themeSurface,
                      borderColor: `${b.themePrimary}25`,
                    }}
                    className="mt-3 p-3 rounded-2xl border text-xs font-semibold leading-relaxed"
                  >
                    <div className="flex items-start gap-1.5 mb-1">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span style={{ color: b.textColor }} className="font-extrabold text-[11px] uppercase">
                        Superpower
                      </span>
                    </div>
                    <p style={{ color: b.textColor }} className="text-[11.5px] pl-5">
                      {b.superpower}
                    </p>
                  </div>
                </div>

                {/* Quote Bubble */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-slate-500 text-[11px] italic">
                  <Quote className="w-3.5 h-3.5 shrink-0 opacity-60 mt-0.5" />
                  <span className="line-clamp-2">&quot;{b.cheerQuote}&quot;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Clay 3D Button */}
      <div className="sticky bottom-4 pt-3 bg-gradient-to-t from-white/90 via-white/70 to-transparent pb-2">
        <ClayButton
          text={`TEAM UP WITH ${selectedBuddy.name.toUpperCase()}! 🚀`}
          onClick={handleConfirm}
          color={selectedBuddy.themePrimary}
          shadowColor={selectedBuddy.themeShadow}
          fontSize={17}
          isExpanded={true}
          icon={<Sparkles className="w-5 h-5 text-amber-300" />}
        />
      </div>
    </div>
  );
};
