
import type { VocabularyQuestion } from "@/types/quiz";

interface QuizCardProps {
  question: VocabularyQuestion;
  score: number;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
}

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

  return (
    <section className="flex w-full flex-col gap-6">
      {/* Level and Score */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#E4F3EC] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
          {question.level} Vocabulary
        </span>

        <div className="rounded-xl bg-[#E4F3EC] px-4 py-2">
          <span className="text-sm font-semibold text-[var(--primary)]">
            🏆 {score}
          </span>
        </div>
      </div>

      {/* German Word */}
      <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl bg-[#F3F8F5] p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          What does this word mean?
        </p>

        <h2 className="w-full min-w-0
                      text-center text-2xl font-bold
                      tracking-tight sm:text-3xl
                      [overflow-wrap:anywhere]">
          {question.word}
        </h2>

        <p className="text-sm text-[var(--muted)]">
          Choose the correct English translation
        </p>
      </div>

      {/* Answer Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionIndex === index;

          const selectedStyles = isCorrect
            ? "border-green-600 bg-green-50 text-green-900"
            : "border-red-600 bg-red-50 text-red-900";

          return (
            <button
              key={index}
              type="button"
              disabled={hasAnswered}
              onClick={() => onSelectOption(index)}
              className={`
                flex min-h-16 w-full items-center gap-4
                rounded-xl border-2 px-4 py-3
                text-left transition-colors duration-150
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[var(--primary)]
                disabled:cursor-default
                ${
                  isSelected
                    ? selectedStyles
                    : "border-[var(--border)] bg-white hover:bg-[#F3F8F5] disabled:hover:bg-white"
                }
              `}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F6F4] text-sm font-semibold text-[var(--foreground)]">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="min-w-0 flex-1 break-words font-medium">
                {option}
              </span>

              {isSelected && (
                <span aria-hidden="true">
                  {isCorrect ? "✓" : "✕"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback */}
      {hasAnswered && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-4 text-center"
        >
          <p
            className={`font-semibold ${
              isCorrect
                ? "text-green-700"
                : "text-red-600"
            }`}
          >
            {isCorrect
              ? "Correct! +1 point"
              : "Incorrect!"}
          </p>

          {isCorrect && (
            <button
              type="button"
              onClick={onNextQuestion}
              className="w-full rounded-xl bg-[var(--primary)] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#115740] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              Next Question →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
