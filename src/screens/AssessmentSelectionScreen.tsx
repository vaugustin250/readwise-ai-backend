import React from 'react';
import { BookOpen, Gamepad2, Award, LineChart, ChevronRight } from 'lucide-react';
import { BuddyMascotBubble } from '../components/BuddyMascotBubble';
import { ChildProfile, ReadingBuddy } from '../types';

interface AssessmentSelectionScreenProps {
  child: ChildProfile;
  buddy: ReadingBuddy;
  onNavigate: (route: string) => void;
  onSelectBuddy: () => void;
}

export const AssessmentSelectionScreen: React.FC<AssessmentSelectionScreenProps> = ({
  child,
  buddy,
  onNavigate,
  onSelectBuddy,
}) => {
  const activities = [
    {
      title: 'Oral Reading Quest 📖',
      subtitle: 'Camera & mic track your voice and reading jumps in real-time',
      badge: 'Earn 100 EXP',
      route: 'reading_assessment',
      icon: <BookOpen className="w-7 h-7 text-[#0284C7]" />,
      color: '#0284C7',
      shadowColor: '#0369A1',
      surfaceColor: '#E0F2FE',
    },
    {
      title: 'Ninja & Alien Brain Games 🧠',
      subtitle: 'Slice b vs d, match rhyming sounds & beat the clock',
      badge: '4 Mini-Games',
      route: 'cognitive_game',
      icon: <Gamepad2 className="w-7 h-7 text-[#E11D48]" />,
      color: '#E11D48',
      shadowColor: '#9F1239',
      surfaceColor: '#FFE4E6',
    },
    {
      title: 'Personalized Daily Coach 🚀',
      subtitle: 'Bimodal line tracking and phonics word flashcards',
      badge: 'Daily 15 Min',
      route: 'learning_activity',
      icon: <Award className="w-7 h-7 text-[#059669]" />,
      color: '#059669',
      shadowColor: '#064E3B',
      surfaceColor: '#D1FAE5',
    },
    {
      title: 'Treasure Map & Reports 🏆',
      subtitle: 'Track reading speed WPM growth & download clinical PDF',
      badge: 'History',
      route: 'progress',
      icon: <LineChart className="w-7 h-7 text-[#D97706]" />,
      color: '#D97706',
      shadowColor: '#92400E',
      surfaceColor: '#FEF3C7',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
      {/* 3D Mascot Companion Greeting */}
      <BuddyMascotBubble
        buddy={buddy}
        message={`${buddy.name}: "Ready for an adventure, ${child.name}? Choose our quest below!"`}
        onBuddyTap={onSelectBuddy}
      />

      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B]">
            {child.name}&apos;s Adventure Hub
          </h2>
          <p className="text-xs text-slate-500 font-bold">
            {child.grade} • Age {child.age}
          </p>
        </div>

        <button
          onClick={onSelectBuddy}
          style={{
            backgroundColor: buddy.themeSurface,
            color: buddy.textColor,
            borderColor: `${buddy.themePrimary}44`,
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black shadow-xs hover:scale-105 transition-all"
        >
          <span>{buddy.emoji}</span>
          <span>Switch Hero</span>
        </button>
      </div>

      {/* Activity Cards List */}
      <div className="grid gap-3.5">
        {activities.map((act) => (
          <div
            key={act.route}
            onClick={() => onNavigate(act.route)}
            style={{
              borderColor: `${act.color}44`,
              boxShadow: `0 5px 0 0 ${act.shadowColor}, 0 10px 18px ${act.shadowColor}22`,
            }}
            className="group bg-white rounded-3xl border-2 p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:translate-y-[-2px] active:translate-y-[2px] transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                style={{
                  backgroundColor: act.surfaceColor,
                  borderColor: `${act.color}55`,
                }}
                className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform"
              >
                {act.icon}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="text-base sm:text-lg font-black text-[#1E1B4B]">
                    {act.title}
                  </h3>
                  <span
                    style={{
                      backgroundColor: act.surfaceColor,
                      color: act.color,
                    }}
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                  >
                    {act.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-snug">
                  {act.subtitle}
                </p>
              </div>
            </div>

            <div
              style={{ color: act.color }}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
