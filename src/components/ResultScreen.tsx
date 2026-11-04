
import type { GermanLevel } from "@/types/quiz";
import { mono } from "@/lib/fonts";

type ResultStatus = "gameOver" | "noMoreWords";

interface ResultScreenProps {
  status: ResultStatus;
  score: number;
  level: GermanLevel;
  onPlayAgain: () => void;
  onChangeLevel: () => void;

  correctAnswer?: {
    word: string;
    selectedMeaning: string;
    correctMeaning: string;
    explanation?: string;
  };

  // Retained for compatibility with page.tsx.
  // In-app reports are handled by ReportQuestion.
  reportHref?: string | null;
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
    <section
      className="flex w-full flex-col gap-5"
      aria-label="Challenge result"
    >
      {/* Result heading */}
      <header className="wm-result-enter flex flex-col items-center gap-3 py-3 text-center">
        <div
          aria-hidden="true"
          className={`
            flex h-18 w-18 items-center
            justify-center rounded-2xl
            border text-3xl
            ${
              isGameOver
                ? "border-rose-500/30 bg-rose-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }
          `}
        >
          {isGameOver ? "🏁" : "🏆"}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {isGameOver
              ? "Game Over"
              : "Session Complete"}
            <span className="text-amber-400">.</span>
          </h1>

          <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-400">
            {isGameOver
              ? "One wrong answer ends the challenge. Ready for another attempt?"
              : "No more unique questions could be generated for this session."}
          </p>
        </div>
      </header>

      {/* Final score */}
      <div
        className="
          wm-result-enter wm-result-delay-1
          relative flex w-full flex-col
          items-center gap-3 overflow-hidden
          rounded-2xl border
          border-[var(--wm-border)]
          bg-[var(--wm-surface)]
          px-5 py-6 text-center
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-1/2 top-0 h-32 w-48
            -translate-x-1/2
            rounded-full bg-amber-500/10
            blur-3xl
          "
        />

        <p
          className={`
            ${mono.className}
            relative text-[11px]
            font-bold uppercase
            tracking-[0.18em]
            text-gray-400
          `}
        >
          Final Score
        </p>

        <div className="relative flex items-baseline gap-2">
          <span
            className={`${mono.className}
              text-6xl font-extrabold
              tabular-nums text-amber-400`}
          >
            {score}
          </span>

          <span className="text-sm text-gray-400">
            points
          </span>
        </div>

        <span
          className={`
            ${mono.className}
            relative rounded-full
            border border-amber-500/20
            bg-amber-500/10
            px-4 py-2
            text-xs font-bold
            text-amber-300
          `}
        >
          {level} VOCABULARY
        </span>
      </div>

      {/* Review incorrect question */}
      {isGameOver && correctAnswer && (
        <section
          className="
            wm-result-enter wm-result-delay-2
            w-full space-y-4 rounded-2xl
            border border-[var(--wm-border)]
            bg-[var(--wm-surface)]
            p-4
          "
          aria-label="Review incorrect answer"
        >
          <div>
            <p
              className={`${mono.className}
                text-[10px] font-bold
                uppercase tracking-widest
                text-amber-400`}
            >
              Learn from this question
            </p>

            <h2
              lang="de"
              className="
                mt-3 break-words
                text-xl font-extrabold
                tracking-tight text-white
                [overflow-wrap:anywhere]
              "
            >
              {correctAnswer.word}
            </h2>
          </div>

          {/* Incorrect answer */}
          <div
            className="
              rounded-xl border
              border-rose-500/30
              bg-rose-500/10
              p-4
            "
          >
            <p
              className={`${mono.className}
                text-[11px] font-bold
                uppercase tracking-wide
                text-rose-300`}
            >
              ✕ Your Answer
            </p>

            <p
              className="
                mt-2 break-words text-sm
                font-medium leading-relaxed
                text-gray-100
                [overflow-wrap:anywhere]
              "
            >
              {correctAnswer.selectedMeaning}
            </p>
          </div>

          {/* Correct answer */}
          <div
            className="
              rounded-xl border
              border-emerald-500/30
              bg-emerald-500/10
              p-4
            "
          >
            <p
              className={`${mono.className}
                text-[11px] font-bold
                uppercase tracking-wide
                text-emerald-300`}
            >
              ✓ Correct Answer
            </p>

            <p
              className="
                mt-2 break-words text-sm
                font-semibold leading-relaxed
                text-gray-100
                [overflow-wrap:anywhere]
              "
            >
              {correctAnswer.correctMeaning}
            </p>
          </div>

          {/* AI explanation */}
          {correctAnswer.explanation && (
            <div
              className="
                rounded-xl border
                border-[var(--wm-border)]
                bg-[var(--wm-surface-raised)]
                p-4
              "
            >
              <p
                className={`${mono.className}
                  text-[11px] font-bold
                  uppercase tracking-wide
                  text-amber-400`}
              >
                Why This Is Correct
              </p>

              <p
                className="
                  mt-3 break-words
                  text-sm leading-relaxed
                  text-gray-300
                  [overflow-wrap:anywhere]
                "
              >
                {correctAnswer.explanation}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Actions */}
      <div className="wm-result-enter wm-result-delay-3 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
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
          Play Again
          <span aria-hidden="true">→</span>
        </button>

        <button
          type="button"
          onClick={onChangeLevel}
          className="
            min-h-14 w-full
            rounded-2xl border
            border-[var(--wm-border)]
            bg-[var(--wm-surface)]
            px-6 py-4
            text-sm font-bold
            text-gray-200
            transition-colors
            hover:border-amber-500/60
            hover:bg-[var(--wm-surface-raised)]
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
