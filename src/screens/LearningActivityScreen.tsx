import React, { useState } from 'react';
import { Check, Mic, BookOpen, Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { ClayButton } from '../components/ClayButton';
import { BuddyMascotBubble } from '../components/BuddyMascotBubble';
import { ChildProfile, ReadingBuddy } from '../types';

interface LearningActivityScreenProps {
  child?: ChildProfile | null;
  buddy: ReadingBuddy;
  onSelectBuddy: () => void;
  onReturnDashboard: () => void;
}

interface Task {
  id: string;
  title: string;
  duration: string;
  category: string;
  icon: React.ReactNode;
  completed: boolean;
}

export const LearningActivityScreen: React.FC<LearningActivityScreenProps> = ({
  child,
  buddy,
  onSelectBuddy,
  onReturnDashboard,
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'b / d Recognition Drill',
      duration: '10 mins',
      category: 'Visual Discrimination',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      completed: true,
    },
    {
      id: '2',
      title: 'Phonics & Sound Blending',
      duration: '10 mins',
      category: 'Phonological Awareness',
      icon: <Volume2 className="w-5 h-5 text-indigo-600" />,
      completed: false,
    },
    {
      id: '3',
      title: 'Sight Word Flash Reader',
      duration: '10 mins',
      category: 'Oral Fluency',
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      completed: false,
    },
    {
      id: '4',
      title: 'Acoustic Pronunciation Drill',
      duration: '5 mins',
      category: 'Speech Precision',
      icon: <Mic className="w-5 h-5 text-rose-600" />,
      completed: false,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      <BuddyMascotBubble
        buddy={buddy}
        message={`${buddy.name}: "15 minutes of daily practice powers up your reading speed!"`}
        onBuddyTap={onSelectBuddy}
      />

      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-black text-[#1E1B4B]">
            Today&apos;s Personalized Plan
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Generated based on {child?.name || 'child&apos;s'} recent screening telemetry.
          </p>
        </div>

        <span
          style={{
            backgroundColor: buddy.themeSurface,
            color: buddy.textColor,
            borderColor: buddy.themePrimary,
          }}
          className="text-xs font-black px-3 py-1.5 rounded-full border shadow-xs"
        >
          {completedCount}/{tasks.length} Completed
        </span>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            style={{
              borderColor: task.completed ? '#10B98144' : '#E2E8F0',
            }}
            className={`bg-white rounded-3xl border-2 p-4 flex items-center justify-between gap-3.5 cursor-pointer transition-all hover:scale-[1.01] ${
              task.completed ? 'bg-emerald-50/20' : ''
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                style={{
                  backgroundColor: task.completed ? '#D1FAE5' : '#F1F5F9',
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              >
                {task.completed ? (
                  <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />
                ) : (
                  task.icon
                )}
              </div>

              <div>
                <h4
                  className={`text-sm sm:text-base font-black text-[#1E1B4B] ${
                    task.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  {task.category} • {task.duration}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleTask(task.id);
              }}
              style={{
                backgroundColor: task.completed ? '#D1FAE5' : buddy.themePrimary,
                color: task.completed ? '#065F46' : '#FFFFFF',
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-transform hover:scale-105"
            >
              {task.completed ? 'Done ✓' : 'Start ➔'}
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <ClayButton
          text="Return to Parent Dashboard 🏠"
          onClick={onReturnDashboard}
          color="#1E1B4B"
          shadowColor="#000000"
          fontSize={15}
          isExpanded={true}
        />
      </div>
    </div>
  );
};
