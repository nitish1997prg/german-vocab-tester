
import type { GermanLevel } from "@/types/quiz";
import { mono } from "@/lib/fonts";

type Props = {
  level: GermanLevel;
  questionNumber: number;
  score: number;
  totalQuestions: number;
  onExit: () => void;
};

export default function BauhausQuizProgress({
  level,
  questionNumber,
  score,
  totalQuestions,
  onExit,
}: Props) {
  // Progress represents completed questions,
  // not the question currently being displayed.
  const completedQuestions = Math.min(
    Math.max(questionNumber - 1, 0),
    totalQuestions
  );

  const progressPercentage =
    totalQuestions > 0
      ? (completedQuestions / totalQuestions) * 100
      : 0;

  return (
    <section
      className="w-full space-y-3 sm:space-y-5"
      aria-label="Quiz progress"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div
          className={`
            ${mono.className}
            rounded-full border
            border-[var(--wm-border)]
            bg-[var(--wm-surface)]
            px-3 py-2
            text-[11px] font-bold
            tracking-wide text-amber-400
          `}
        >
          {level} · QUIZ MODE
        </div>

        <button
          type="button"
          onClick={onExit}
          className="
            min-h-10 rounded-xl border
            border-[var(--wm-border)]
            bg-[var(--wm-surface)]
            px-4 py-2
            text-sm font-medium text-gray-300
            transition-colors
            hover:border-amber-500
            hover:text-white
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-amber-400
          "
        >
          Exit Quiz
        </button>
      </div>

      {/* Progress and score */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className={`
              ${mono.className}
              mb-1 text-[10px] font-bold
              uppercase tracking-wider text-gray-400
            `}
          >
            Your Progress
          </p>

          <h2 className="text-xl font-extrabold text-white">
            Question {questionNumber}
            <span className="ml-1 text-sm font-medium text-gray-400">
              / {totalQuestions}
            </span>
          </h2>
        </div>

        <div className="text-right">
          <p
            className={`
              ${mono.className}
              mb-1 text-[10px] font-bold
              uppercase tracking-wider text-gray-400
            `}
          >
            Score
          </p>

          <p className="text-xl font-extrabold text-emerald-400">
            {score}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label="Questions completed"
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-valuenow={completedQuestions}
        className="
          h-2 w-full overflow-hidden
          rounded-full bg-[var(--wm-border)]
        "
      >
        <div
          className="
            h-full rounded-full
            bg-gradient-to-r
            from-amber-500 to-amber-400
            transition-[width] duration-300
            motion-reduce:transition-none
          "
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>
    </section>
  );
}
