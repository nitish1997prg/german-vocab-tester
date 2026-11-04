
"use client";

import { useEffect, useRef } from "react";

import type { VocabularyQuestion } from "@/types/quiz";

import BauhausQuestionPanel from "@/components/quiz/BauhausQuestionPanel";

import { playSound } from "@/lib/sound-effects";
import { playHaptic } from "@/lib/haptics";

interface QuizCardProps {
  question: VocabularyQuestion;
  score: number;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
  reportHref?: string | null;
}

const STREAK_MILESTONES: Record<
  number,
  {
    title: string;
    message: string;
    className: string;
  }
> = {
  5: {
    title: "🔥 5 IN A ROW!",
    message: "Sehr gut! Keep going!",
    className:
      "border-amber-500/60 bg-[#292217] text-amber-300",
  },

  10: {
    title: "⚡ 10 IN A ROW!",
    message: "Fantastisch! Halfway there!",
    className:
      "border-blue-500/60 bg-[#192A42] text-blue-300",
  },

  15: {
    title: "🏆 15 IN A ROW!",
    message: "Unglaublich! Just five more!",
    className:
      "border-emerald-500/60 bg-[#15362E] text-emerald-300",
  },
};

const NORMAL_ADVANCE_DELAY = 900;
const STREAK_ADVANCE_DELAY = 2100;

export default function QuizCard({
  question,
  score,
  selectedOptionIndex,
  onSelectOption,
  onNextQuestion,
}: QuizCardProps) {
  const hasAnswered = selectedOptionIndex !== null;

  const isCorrect =
    hasAnswered &&
    selectedOptionIndex === question.correctOptionIndex;

  const streakMilestone = isCorrect
    ? STREAK_MILESTONES[score]
    : undefined;

  // Keep the latest callback without restarting the timer
  // whenever the parent component renders.
  const onNextQuestionRef = useRef(onNextQuestion);

  useEffect(() => {
    onNextQuestionRef.current = onNextQuestion;
  }, [onNextQuestion]);

  // Automatically advance after a correct answer.
  useEffect(() => {
    if (!isCorrect) {
      return;
    }

    const delay = streakMilestone
      ? STREAK_ADVANCE_DELAY
      : NORMAL_ADVANCE_DELAY;

    const timer = window.setTimeout(() => {
      onNextQuestionRef.current();
    }, delay);

    // Cancel if the question changes or component unmounts.
    return () => {
      window.clearTimeout(timer);
    };
  }, [isCorrect, question.id, streakMilestone]);

  return (
    <section
      aria-label="Vocabulary challenge"
      className="flex w-full flex-col gap-3 sm:gap-5"
    >
      <BauhausQuestionPanel
        key={question.id}
        question={question}
        selectedOptionIndex={selectedOptionIndex}
        onSelectOption={(index) => {
          if (selectedOptionIndex !== null) {
            return;
          }

          const correct =
            index === question.correctOptionIndex;

          playSound(correct ? "success" : "error");
          playHaptic(correct ? "success" : "error");

          onSelectOption(index);
        }}
      />

      {/* Standard feedback — stays compact */}
      {hasAnswered && (
        <div
          className="wm-feedback-enter"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p
            className={`
              text-center text-sm font-bold
              ${
                isCorrect
                  ? "correct-answer-animation text-emerald-400"
                  : "text-rose-400"
              }
            `}
          >
            {isCorrect
              ? "✓ Richtig! +1 point"
              : "✕ Incorrect!"}
          </p>
        </div>
      )}

      {/* Streak popup — does not occupy page space */}
      {streakMilestone && (
        <div
          className="
            pointer-events-none
            fixed inset-0 z-50
            flex items-center justify-center
            bg-[#0F1117]/70
            px-5
          "
        >
          <div
            role="status"
            aria-live="polite"
            className={`
              wm-streak-popup
              w-full max-w-xs
              rounded-3xl border-2
              p-7 text-center
              shadow-2xl
              ${streakMilestone.className}
            `}
          >
            <h2 className="text-2xl font-extrabold">
              {streakMilestone.title}
            </h2>

            <p className="mt-3 text-sm font-semibold text-gray-100">
              {streakMilestone.message}
            </p>

            <p className="mt-5 text-xs font-medium text-gray-400">
              Next question coming up...
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
