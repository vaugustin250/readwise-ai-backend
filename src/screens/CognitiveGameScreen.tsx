import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ClayButton } from '../components/ClayButton';
import { BuddyMascotBubble } from '../components/BuddyMascotBubble';
import { cognitiveScoreService } from '../services/cognitiveScoreService';
import { ChildProfile, ReadingBuddy } from '../types';

interface CognitiveGameScreenProps {
  child: ChildProfile;
  buddy: ReadingBuddy;
  onFinish: () => void;
  onSelectBuddy: () => void;
}

const ROUNDS = [
  {
    title: 'Letter Discrimination',
    instruction: 'Tap the letter that matches the prompt:',
    prompt: 'b',
    options: ['d', 'p', 'b', 'q'],
    correct: 'b',
    type: 'visual',
    hint: 'Watch the belly direction! "b" stands tall and faces right!',
  },
  {
    title: 'Rhyme & Phonological Match',
    instruction: 'Which word rhymes with:',
    prompt: 'CAT',
    options: ['BAT', 'DOG', 'PEN', 'CUP'],
    correct: 'BAT',
    type: 'phonological',
    hint: 'Listen for the ending "-AT" sound! CAT... ?',
  },
  {
    title: 'Letter Orientation',
    instruction: 'Find the correctly oriented letter:',
    prompt: 'p',
    options: ['q', 'b', 'd', 'p'],
    correct: 'p',
    type: 'visual',
    hint: 'The tail hangs down on the left, loop on the top right!',
  },
  {
    title: 'Phoneme Blending',
    instruction: 'Blend the sounds together:',
    prompt: '/s/ + /u/ + /n/',
    options: ['SUN', 'RUN', 'FUN', 'SONG'],
    correct: 'SUN',
    type: 'phonological',
    hint: 'Slide the sounds smoothly together: sss-uuu-nnn!',
  },
];

export const CognitiveGameScreen: React.FC<CognitiveGameScreenProps> = ({
  child,
  buddy,
  onFinish,
  onSelectBuddy,
}) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [latenciesMs, setLatenciesMs] = useState<number[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const roundStartTime = useRef<number>(Date.now());

  useEffect(() => {
    roundStartTime.current = Date.now();
  }, [currentRound]);

  const handleOptionSelected = (selectedOption: string) => {
    const latency = Date.now() - roundStartTime.current;
    const isCorrect = selectedOption === ROUNDS[currentRound].correct;

    const newLatencies = [...latenciesMs, latency];
    setLatenciesMs(newLatencies);

    const newCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
    if (isCorrect) setCorrectAnswers(newCorrect);

    setFeedback({
      isCorrect,
      text: isCorrect
        ? `⭐ Awesome hit! (${latency}ms)`
        : 'Keep going! Every practice powers your brain!',
    });

    setTimeout(() => {
      setFeedback(null);
      if (currentRound + 1 < ROUNDS.length) {
        setCurrentRound((prev) => prev + 1);
      } else {
        finishGame(newCorrect, newLatencies);
      }
    }, 700);
  };

  const finishGame = (finalCorrect: number, allLatencies: number[]) => {
    const totalRounds = ROUNDS.length;
    const accuracy = finalCorrect / totalRounds;
    const avgLatency =
      allLatencies.length > 0
        ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
        : 2000;

    const speedBonus = Math.min(15, Math.max(-15, ((3500 - avgLatency) / 3500) * 20));
    const workingMemoryScore = Math.min(98, Math.max(35, accuracy * 80 + speedBonus + 10));
    const phonologicalScore = Math.min(96, Math.max(30, accuracy * 85 + 10));

    cognitiveScoreService.recordScores(
      child.id,
      Number(workingMemoryScore.toFixed(1)),
      Number(phonologicalScore.toFixed(1))
    );

    setGameCompleted(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (_) {
      // Ignore
    }
  };

  if (gameCompleted) {
    const wm = cognitiveScoreService.getWorkingMemory(child.id);
    const ph = cognitiveScoreService.getPhonologicalAwareness(child.id);

    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 text-center space-y-6">
        {/* Celebratory Badge */}
        <div className="flex justify-center pt-6">
          <div
            style={{
              backgroundColor: buddy.themeSurface,
              borderColor: buddy.themePrimary,
              boxShadow: `0 10px 25px ${buddy.themeShadow}44`,
            }}
            className="w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl shadow-xl animate-bounce"
          >
            {buddy.emoji}
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
            Super Reader Level Up! 🏆
          </h2>
          <p className="text-sm font-semibold text-slate-600 mt-2">
            {child.name} scored {correctAnswers}/{ROUNDS.length} challenges with {buddy.name}!
          </p>
        </div>

        {/* 3D Tactile Metric Tiles */}
        <div
          style={{
            borderColor: `${buddy.themePrimary}33`,
            boxShadow: `0 6px 20px ${buddy.themeShadow}18`,
          }}
          className="bg-white rounded-3xl border-2 p-6 grid grid-cols-2 gap-4 divide-x divide-slate-100"
        >
          <div className="text-center">
            <span
              style={{ color: buddy.textColor }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Working Memory
            </span>
            <span
              style={{ color: buddy.themePrimary }}
              className="text-3xl sm:text-4xl font-black block"
            >
              {wm}
            </span>
            <span className="text-[11px] font-bold text-slate-400">pts</span>
          </div>

          <div className="text-center pl-4">
            <span
              style={{ color: buddy.textColor }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Phonology Power
            </span>
            <span
              style={{ color: buddy.themeSecondary }}
              className="text-3xl sm:text-4xl font-black block"
            >
              {ph}
            </span>
            <span className="text-[11px] font-bold text-slate-400">pts</span>
          </div>
        </div>

        <div className="pt-4">
          <ClayButton
            text="Return to Adventure Hub 🚀"
            onClick={onFinish}
            color={buddy.themePrimary}
            shadowColor={buddy.themeShadow}
            fontSize={17}
            isExpanded={true}
          />
        </div>
      </div>
    );
  }

  const round = ROUNDS[currentRound];

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 space-y-4">
      {/* Header and points badge */}
      <div className="flex items-center justify-between pb-1">
        <span
          style={{ color: buddy.themePrimary }}
          className="text-xs font-black tracking-widest uppercase"
        >
          Arcade Drill ({currentRound + 1}/{ROUNDS.length})
        </span>

        <span
          style={{
            backgroundColor: buddy.themeSurface,
            color: buddy.textColor,
            borderColor: buddy.themePrimary,
          }}
          className="text-xs font-black px-3 py-1 rounded-full border shadow-xs"
        >
          ⭐ {correctAnswers} Points
        </span>
      </div>

      {/* Mascot Hint Bubble */}
      <BuddyMascotBubble
        buddy={buddy}
        message={`${buddy.name}: "${round.hint}"`}
        onBuddyTap={onSelectBuddy}
      />

      <div className="text-center pt-2">
        <span
          style={{ color: buddy.themePrimary }}
          className="text-[11px] font-black uppercase tracking-wider"
        >
          {round.title}
        </span>
        <h3 className="text-base sm:text-lg font-black text-[#1E1B4B] mt-0.5">
          {round.instruction}
        </h3>
      </div>

      {/* 3D Giant Prompt Crucible Card */}
      <div
        style={{
          borderColor: `${buddy.themePrimary}55`,
          boxShadow: `0 8px 0 0 ${buddy.themeShadow}, 0 16px 25px ${buddy.themeShadow}22`,
        }}
        className="bg-white rounded-3xl border-3 py-8 px-6 text-center my-4"
      >
        <span
          style={{ color: buddy.themePrimary }}
          className="text-5xl sm:text-6xl font-black tracking-widest select-none"
        >
          {round.prompt}
        </span>
      </div>

      {feedback && (
        <div
          className={`p-2.5 rounded-2xl text-center text-xs font-black animate-in fade-in ${
            feedback.isCorrect
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* 3D Tactile Push-Down Answer Blocks */}
      <div className="grid grid-cols-2 gap-3.5 pt-2">
        {round.options.map((opt) => (
          <ClayButton
            key={opt}
            text={opt}
            onClick={() => handleOptionSelected(opt)}
            color="#FFFFFF"
            shadowColor={`${buddy.themeShadow}99`}
            textColor={buddy.textColor}
            depth={5}
            fontSize={28}
            className="py-4"
          />
        ))}
      </div>
    </div>
  );
};
