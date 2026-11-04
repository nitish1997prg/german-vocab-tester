
"use client";

import { useEffect, useRef } from "react";

import type { VocabularyQuestion } from "@/types/quiz";

import BauhausQuestionPanel from "@/components/quiz/BauhausQuestionPanel";
import { playSound } from "@/lib/sound-effects";

interface QuizCardProps {
  question: VocabularyQuestion;
  score: number;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;

  // Kept temporarily for compatibility with page.tsx.
  // In-app reporting is handled by ReportQuestion.
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
    title: "🔥 5 in a row!",
    message: "Sehr gut! Keep going!",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },

  10: {
    title: "⚡ 10 in a row!",
    message: "Fantastisch! Halfway there!",
    className:
      "border-blue-500/40 bg-blue-500/10 text-blue-300",
  },

  15: {
    title: "🏆 15 in a row!",
    message: "Unglaublich! Just five more!",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
};

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

  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Preserve keyboard accessibility without
  // automatically scrolling the phone viewport.
  useEffect(() => {
    if (isCorrect) {
      nextButtonRef.current?.focus({
        preventScroll: true,
      });
    }
  }, [isCorrect]);

  const streakMilestone = isCorrect
    ? STREAK_MILESTONES[score]
    : undefined;

  return (
    <section
      className="flex w-full flex-col gap-5"
      aria-label="Vocabulary challenge"
    >
      {/* Question and answer options */}
      <BauhausQuestionPanel
        question={question}
        selectedOptionIndex={selectedOptionIndex}
        onSelectOption={(index) => {
          if (selectedOptionIndex !== null) {
            return;
          }

          const correct =
            index === question.correctOptionIndex;

          playSound(correct ? "success" : "error");

          onSelectOption(index);
        }}
            />

      {/* Answer feedback */}
      {hasAnswered && (
        <div className="flex flex-col gap-4">
          {/* Screen-reader announcement */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex flex-col gap-3"
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

            {/* Streak milestone */}
            {streakMilestone && (
              <div
                className={`
                  streak-milestone-animation
                  rounded-2xl border p-4
                  text-center shadow-lg
                  ${streakMilestone.className}
                `}
              >
                <p className="text-lg font-extrabold">
                  {streakMilestone.title}
                </p>

                <p className="mt-1 text-sm font-medium">
                  {streakMilestone.message}
                </p>
              </div>
            )}
          </div>

          {/* Next Question */}
          {isCorrect && (
            <button
              ref={nextButtonRef}
              type="button"
              onClick={onNextQuestion}
              className="
                flex min-h-14 w-full
                items-center justify-center
                gap-2 rounded-2xl
                bg-gradient-to-r
                from-amber-500 to-amber-600
                px-6 py-4
                text-sm font-extrabold
                tracking-wide text-[#0F1117]
                shadow-[0_8px_30px_-10px_rgba(245,158,11,0.45)]
                transition-[filter,transform]
                duration-200
                hover:brightness-110
                motion-safe:active:scale-[0.98]
                motion-reduce:transition-none
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-amber-400
              "
            >
              Next Question
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
