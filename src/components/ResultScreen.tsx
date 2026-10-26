
import type { GermanLevel } from "@/types/quiz";

type ResultStatus = "gameOver" | "noMoreWords";

interface ResultScreenProps {
  status: ResultStatus;
  score: number;
  level: GermanLevel;
  correctAnswer?: string;
  onPlayAgain: () => void;
  onChangeLevel: () => void;
}

export default function ResultScreen({
  status,
  score,
  level,
  correctAnswer,
  onPlayAgain,
  onChangeLevel,
}: ResultScreenProps) {
  const isGameOver = status === "gameOver";

  return (
    <section className="flex w-full flex-col items-center gap-6 text-center">

      {/* Result Icon */}
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
          isGameOver
            ? "bg-[#FCE8E6]"
            : "bg-[#E4F3EC]"
        }`}
        aria-hidden="true"
      >
        {isGameOver ? "🏁" : "🏆"}
      </div>

      {/* Result Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {isGameOver
            ? "Game Over!"
            : "No More Words Available!"}
        </h2>

        <p className="text-sm text-[var(--muted)]">
          {isGameOver
            ? "One wrong answer ends the challenge. How far did you get?"
            : "You've reached the end of the available vocabulary for this session."}
        </p>
      </div>

      {/* Final Score */}
      <div className="flex w-full flex-col items-center gap-2 rounded-2xl bg-[#F3F8F5] p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Final Score
        </p>

        <p className="text-6xl font-bold tabular-nums">
          {score}
        </p>

        <span className="rounded-full bg-[#E4F3EC] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
          {level} Vocabulary
        </span>
      </div>

      {/* Correct Answer */}
      {isGameOver && correctAnswer && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">
            The correct answer was
          </p>

          <p className="text-xl font-semibold text-[var(--primary)]">
            {correctAnswer}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full rounded-xl bg-[var(--primary)] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#115740] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          Play Again →
        </button>

        <button
          type="button"
          onClick={onChangeLevel}
          className="w-full rounded-xl border-2 border-[var(--border)] bg-white px-6 py-4 font-semibold transition-colors hover:bg-[#F3F8F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          Change Level
        </button>
      </div>
    </section>
  );
}
