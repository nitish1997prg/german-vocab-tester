
"use client";

import type { VocabularyQuestion } from "@/types/quiz";
import { mono } from "@/lib/fonts";

type Props = {
  question: VocabularyQuestion;
  selectedOptionIndex: number | null;
  onSelectOption: (
    index: number
  ) => void | Promise<void>;
};

const ARTICLE_STYLES = {
  der: {
    label: "MASCULINE",
    color: "#60A5FA",
    background: "rgba(59,130,246,0.12)",
  },
  die: {
    label: "FEMININE",
    color: "#F472B6",
    background: "rgba(236,72,153,0.12)",
  },
  das: {
    label: "NEUTER",
    color: "#FBBF24",
    background: "rgba(245,158,11,0.12)",
  },
} as const;

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function BauhausQuestionPanel({
  question,
  selectedOptionIndex,
  onSelectOption,
}: Props) {
  const hasAnswered = selectedOptionIndex !== null;

  // Only detect an article at the beginning of
  // a generated vocabulary word.
  const match = /^(der|die|das)\s+(.+)$/i.exec(
    question.word.trim()
  );

  const article = match?.[1].toLowerCase() as
    | keyof typeof ARTICLE_STYLES
    | undefined;

  const displayedWord = match
    ? match[2]
    : question.word;

  const articleStyle = article
    ? ARTICLE_STYLES[article]
    : null;

  return (
    <section
      aria-label="Vocabulary question"
      className="w-full space-y-4"
    >
      {/* Main vocabulary card */}
      <div
        className="
          rounded-2xl border
          border-[var(--wm-border)]
          bg-[var(--wm-surface)]
          px-4 py-5
          shadow-[0_12px_35px_-20px_rgba(0,0,0,0.6)]
        "
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={`${mono.className}
              text-[10px] font-bold
              tracking-wider text-amber-400`}
          >
            TRANSLATE THIS WORD
          </p>

          {article && articleStyle && (
            <span
              className={`${mono.className}
                rounded-lg px-2 py-1
                text-[10px] font-bold`}
              style={{
                color: articleStyle.color,
                backgroundColor:
                  articleStyle.background,
              }}
            >
              {article.toUpperCase()} ·{" "}
              {articleStyle.label}
            </span>
          )}
        </div>

        <h2
          className="
            mt-5 break-words text-center
            text-[clamp(1.5rem,7vw,2rem)]
            font-extrabold leading-tight
            tracking-tight text-white
          "
          lang="de"
        >
          {displayedWord}
        </h2>

        <p
          className="
            mt-4 text-center
            text-xs text-gray-400
          "
        >
          Choose the correct English meaning
        </p>
      </div>

      {/* Answer options */}
      <div
        role="group"
        aria-label="Answer choices"
        className="grid gap-3"
      >
        {question.options.map((option, index) => {
          const isSelected =
            selectedOptionIndex === index;

          const isCorrectAnswer =
            hasAnswered &&
            index === question.correctOptionIndex;

          const isWrongSelection =
            isSelected && !isCorrectAnswer;

          let buttonStyles = `
            border-[var(--wm-border)]
            bg-[var(--wm-surface)]
            enabled:hover:border-amber-500/70
          `;

          if (isCorrectAnswer) {
            buttonStyles = `
              border-emerald-400
              bg-emerald-500/10
            `;
          } else if (isWrongSelection) {
            buttonStyles = `
              border-rose-400
              bg-rose-500/10
            `;
          }

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              disabled={hasAnswered}
              aria-pressed={isSelected}
              onClick={() => {
                void onSelectOption(index);
              }}
              className={`
                flex min-h-14 w-full
                items-center gap-3
                rounded-xl border
                px-3 py-3 text-left
                transition-[background-color,border-color,transform]
                duration-200

                motion-safe:enabled:active:scale-[0.98]
                motion-reduce:transition-none

                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-amber-400

                disabled:cursor-default

                ${buttonStyles}
              `}
            >
              {/* Option label */}
              <span
                className={`
                  ${mono.className}
                  flex h-9 w-9
                  shrink-0 items-center
                  justify-center
                  rounded-lg
                  bg-[var(--wm-surface-hover)]
                  text-xs font-bold
                  text-amber-400
                `}
              >
                {OPTION_LABELS[index] ??
                  String(index + 1)}
              </span>

              {/* Answer text */}
              <span
                className="
                  min-w-0 flex-1
                  break-words
                  text-sm font-medium
                  leading-relaxed
                  text-gray-100
                "
              >
                {option}
              </span>

              {isCorrectAnswer && (
                <span
                  aria-label="Correct answer"
                  className="text-lg font-bold text-emerald-400"
                >
                  ✓
                </span>
              )}

              {isWrongSelection && (
                <span
                  aria-label="Incorrect answer"
                  className="text-lg font-bold text-rose-400"
                >
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
