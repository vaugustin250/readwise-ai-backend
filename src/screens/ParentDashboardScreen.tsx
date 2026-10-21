import React, { useEffect, useState } from 'react';
import { ChevronRight, Plus, UserCircle, LineChart, Sparkles } from 'lucide-react';
import { ClayButton } from '../components/ClayButton';
import { BuddyMascotBubble } from '../components/BuddyMascotBubble';
import { profileService } from '../services/profileService';
import { ChildProfile, ReadingBuddy } from '../types';

interface ParentDashboardScreenProps {
  buddy: ReadingBuddy;
  onSelectChild: (child: ChildProfile) => void;
  onAddChild: () => void;
  onViewProgress: (child?: ChildProfile) => void;
  onSelectBuddy: () => void;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  buddy,
  onSelectChild,
  onAddChild,
  onViewProgress,
  onSelectBuddy,
}) => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    setLoading(true);
    const data = await profileService.getChildren();
    setChildren(data);
    setLoading(false);
  };

  useEffect(() => {
    loadChildren();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Buddy Mascot Greeting Banner */}
      <BuddyMascotBubble
        buddy={buddy}
        message={`${buddy.name}: "${buddy.cheerQuote}"`}
        onBuddyTap={onSelectBuddy}
      />

      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
            Child Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Select a child to launch an oral reading quest, arcade games, or view assessment reports.
          </p>
        </div>

        <button
          onClick={() => onViewProgress(children[0])}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-extrabold text-[#1E1B4B] shadow-xs hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          <LineChart className="w-4 h-4 text-indigo-600" />
          <span>Longitudinal Trajectory</span>
        </button>
      </div>

      {/* Children list */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold animate-pulse">
            Loading child profiles...
          </div>
        ) : children.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center">
            <p className="text-sm font-bold text-slate-500 mb-4">No child profiles found yet.</p>
            <ClayButton
              text="+ Add First Child"
              color={buddy.themePrimary}
              shadowColor={buddy.themeShadow}
              onClick={onAddChild}
            />
          </div>
        ) : (
          children.map((child) => (
            <div
              key={child.id}
              onClick={() => onSelectChild(child)}
              className="group bg-white rounded-3xl border-2 border-slate-200/90 p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div
                  style={{
                    backgroundColor: `${buddy.themePrimary}18`,
                    borderColor: `${buddy.themePrimary}44`,
                  }}
                  className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform"
                >
                  <UserCircle className="w-8 h-8 text-[#1E1B4B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#1E1B4B] group-hover:text-indigo-900 transition-colors">
                      {child.name}
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {child.language || 'English'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                    Age {child.age} • {child.grade}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Quest
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        <ClayButton
          text="+ Add Child Profile"
          onClick={onAddChild}
          color={buddy.themePrimary}
          shadowColor={buddy.themeShadow}
          isExpanded={true}
          icon={<Plus className="w-5 h-5" />}
        />
      </div>

      {/* Hero Tip Tile */}
      <div
        style={{ backgroundColor: buddy.themeSurface, borderColor: `${buddy.themePrimary}33` }}
        className="rounded-3xl border-2 p-4 flex items-center gap-3"
      >
        <span className="text-2xl">{buddy.emoji}</span>
        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
          <strong className="text-[#1E1B4B]">{buddy.name}&apos;s Reading Tip:</strong> Practice with short 10-15 minute daily sessions. Reading with high contrast and our dyslexia-friendly font reduces eye fatigue!
        </p>
      </div>
    </div>
  );
};
