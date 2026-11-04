
import type { GermanLevel } from "@/types/quiz";
import { getNextLevel } from "@/lib/quiz-levels";
import { mono } from "@/lib/fonts";

type ChallengeCompleteScreenProps = {
  level: GermanLevel;
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
  onChangeLevel: () => void;
  onTryNextLevel: (level: GermanLevel) => void;
};

export default function ChallengeCompleteScreen({
  level,
  score,
  totalQuestions,
  onPlayAgain,
  onChangeLevel,
  onTryNextLevel,
}: ChallengeCompleteScreenProps) {
  const nextLevel = getNextLevel(level);

  const isPerfectScore =
    totalQuestions > 0 && score === totalQuestions;

  return (
    <section
      aria-labelledby="completion-title"
      className="flex w-full flex-col gap-5"
    >
      {/* Celebration header */}
      <header className="wm-result-enter flex flex-col items-center gap-3 py-4 text-center">
        
    <div className="relative flex items-center justify-center">
      {/* One-time celebratory halo */}
      <span
        aria-hidden="true"
        className="
          wm-trophy-halo
          pointer-events-none
          absolute -inset-3
          rounded-3xl
          border-2 border-amber-400/50
        "
      />

      {/* Existing trophy animation */}
      <div
        aria-hidden="true"
        className="
          completion-trophy-animation
          relative flex h-20 w-20
          items-center justify-center
          rounded-2xl border
          border-amber-500/30
          bg-amber-500/10
          text-5xl
          motion-reduce:animate-none
        "
      >
        🏆
      </div>
    </div>


        <p
          className={`${mono.className}
            text-[11px] font-bold
            tracking-[0.18em]
            text-amber-400`}
        >
          HERVORRAGEND!
        </p>

        <h1
          id="completion-title"
          className="
            text-3xl font-extrabold
            leading-tight tracking-tight
            text-white
          "
        >
          Challenge Complete
          <span className="text-amber-400">.</span>
        </h1>

        <p className="max-w-xs text-sm leading-relaxed text-gray-400">
          Ausgezeichnet! You conquered the{" "}
          {level} vocabulary challenge.
        </p>
      </header>

      {/* Final score card */}
      <div
        className="
          wm-result-enter wm-result-delay-1
          relative flex w-full flex-col
          items-center gap-3
          overflow-hidden rounded-2xl
          border border-[var(--wm-border)]
          bg-[var(--wm-surface)]
          px-5 py-7 text-center
        "
      >
        {/* Decorative gold glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-1/2 top-0
            h-32 w-48 -translate-x-1/2
            rounded-full bg-amber-500/10
            blur-3xl
          "
        />

        <p
          className={`${mono.className}
            relative text-[11px]
            font-bold uppercase
            tracking-[0.18em]
            text-gray-400`}
        >
          Your Final Score
        </p>

        <div
          className="
            completion-score-animation
            relative flex items-baseline
            justify-center gap-2
            motion-reduce:animate-none
          "
        >
          <span
            className={`${mono.className}
              text-6xl font-extrabold
              tabular-nums text-amber-400`}
          >
            {score}
          </span>

          <span className="text-xl font-semibold text-gray-400">
            / {totalQuestions}
          </span>
        </div>

        <span
          className={`${mono.className}
            relative rounded-full
            border border-amber-500/20
            bg-amber-500/10
            px-4 py-2 text-xs
            font-bold text-amber-300`}
        >
          {level} VOCABULARY
        </span>

        {isPerfectScore && (
          <div
            className="
              relative mt-1 inline-flex
              items-center gap-2
              rounded-full
              border border-emerald-500/30
              bg-emerald-500/10
              px-4 py-2
              text-xs font-bold
              text-emerald-300
            "
          >
            <span aria-hidden="true">✓</span>
            PERFECT CHALLENGE
          </div>
        )}
      </div>

      {/* Achievement message */}
      <div
        className="
          wm-result-enter wm-result-delay-2
          rounded-2xl border
          border-[var(--wm-border)]
          bg-[var(--wm-surface)]
          p-4 text-center
        "
      >
        <p className="text-sm font-semibold text-gray-100">
          Übung macht den Meister!
        </p>

        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          {isPerfectScore
            ? "You answered every question correctly. An impressive achievement!"
            : "You've completed the challenge. Keep practicing to improve your score!"}
        </p>
      </div>

      {/* Next level */}
      {nextLevel ? (
        <div
          className="
            wm-result-enter wm-result-delay-3
            flex flex-col gap-3
            rounded-2xl border
            border-[var(--wm-border)]
            bg-[var(--wm-surface)]
            p-4
          "
        >
          <div>
            <p className="text-sm font-bold text-white">
              Ready for something harder?
            </p>

            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              Continue your German learning journey
              with the {nextLevel} vocabulary challenge.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onTryNextLevel(nextLevel)}
            className="
              flex min-h-14 w-full
              items-center justify-center gap-2
              rounded-xl
              bg-gradient-to-r
              from-amber-500 to-amber-600
              px-5 py-4
              text-sm font-extrabold
              text-[#0F1117]
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
            Try {nextLevel} Challenge
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <div
          className="
            rounded-2xl border
            border-amber-500/20
            bg-amber-500/10
            p-4 text-center
          "
        >
          <p className="font-bold text-amber-300">
            You&apos;ve reached B2!
          </p>

          <p className="mt-2 text-sm text-gray-300">
            You&apos;ve completed the highest level
            currently available in the app.
          </p>
        </div>
      )}

      {/* Replay and navigation */}
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className={`
            wm-result-enter wm-result-delay-4
            min-h-14 w-full
            rounded-2xl px-6 py-4
            text-sm font-bold
            transition-colors
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-amber-400
            ${
              nextLevel
                ? `
                  border border-[var(--wm-border)]
                  bg-[var(--wm-surface-raised)]
                  text-gray-100
                  hover:bg-[var(--wm-surface-hover)]
                `
                : `
                  bg-amber-500 text-[#0F1117]
                  hover:bg-amber-400
                `
            }
          `}
        >
          Play Again
        </button>

        <button
          type="button"
          onClick={onChangeLevel}
          className="
            wm-result-enter wm-result-delay-4
            min-h-12 w-full
            rounded-xl px-5 py-3
            text-sm font-medium
            text-gray-400
            transition-colors
            hover:text-amber-400
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-amber-400
          "
        >
          Change Level
        </button>
      </div>
    </section>
  );
}
