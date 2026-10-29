
import type { GermanLevel } from "@/types/quiz";
import { getNextLevel } from "@/lib/quiz-levels";

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
  return (
    <section
      aria-labelledby="completion-title"
      className="flex w-full flex-col items-center gap-5 text-center"
    >
      <div
        aria-hidden="true"
        className="completion-trophy-animation
    mx-auto flex h-24 w-24 items-center
    justify-center rounded-full bg-[#E4F3EC]
    text-5xl"
      >
        🏆
      </div>

      <div className="space-y-2">
        <h2
          id="completion-title"
          className="text-2xl font-bold"
        >
          Challenge Complete!
        </h2>

        <p className="text-sm text-[var(--muted)]">
          Ausgezeichnet! You conquered the{" "}
          {level} vocabulary challenge.
        </p>
      </div>

      <div className="space-y-1">
        <p className="completion-score-animation text-4xl font-bold text-[var(--primary)]">
          {score} / {totalQuestions}
        </p>
        <p className="text-center text-sm font-medium text-[var(--primary)]">
          Hervorragend! You've completed the {level} challenge!
        </p>
      </div>

      <div
        className="w-full rounded-xl border border-green-200
                   bg-green-50 p-4 text-sm font-medium
                   text-green-800"
      >
        You answered every question correctly!
      </div>

      <div className="flex w-full flex-col gap-3">
        
        {nextLevel && (
          <div className="space-y-3 rounded-xl bg-green-50 p-4">
            <div className="space-y-1">
              <p className="font-semibold text-green-900">
                Ready for something harder?
              </p>

              <p className="text-sm text-green-800">
                Try the {nextLevel} vocabulary challenge.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onTryNextLevel(nextLevel)}
              className="w-full rounded-xl bg-green-700
                        px-6 py-3 font-semibold text-white
                        hover:bg-green-800"
            >
              Try {nextLevel} Challenge
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-xl bg-green-700 px-6 py-3
                     font-semibold text-white
                     hover:bg-green-800"
        >
          Play Again
        </button>

        <button
          type="button"
          onClick={onChangeLevel}
          className="rounded-xl border border-[var(--border)]
                     px-6 py-3 font-medium"
        >
          Change Level
        </button>
      </div>
    </section>
  );
}
