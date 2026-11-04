
"use client";

import { useEffect, useRef, useState } from "react";

import { mono } from "@/lib/fonts";
import { playHaptic } from "@/lib/haptics";

import {
  WARMUP_WORDS,
  isCorrectArticle,
  nextWarmupIndex,
  type GermanArticle,
} from "@/lib/article-warmup";

import { playSound } from "@/lib/sound-effects";

const ARTICLES: {
  article: GermanArticle;
  gender: string;
  color: string;
}[] = [
  {
    article: "der",
    gender: "MASCULINE",
    color: "#60A5FA",
  },
  {
    article: "die",
    gender: "FEMININE",
    color: "#F472B6",
  },
  {
    article: "das",
    gender: "NEUTER",
    color: "#FBBF24",
  },
];

const CORRECT_DELAY = 900;
const INCORRECT_DELAY = 1400;

export default function ArticleWarmup() {
  const [wordIndex, setWordIndex] = useState(0);

  const [streak, setStreak] = useState(0);

  const [selectedArticle, setSelectedArticle] =
    useState<GermanArticle | null>(null);

  const lockedRef = useRef(false);

  const timeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  const currentWord = WARMUP_WORDS[wordIndex];

  const hasAnswered = selectedArticle !== null;

  const wasCorrect =
    hasAnswered &&
    isCorrectArticle(currentWord, selectedArticle);

  // Clear pending word transitions on unmount.
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleArticleSelection(
    article: GermanArticle
  ) {
    // Prevent double taps before React renders.
    if (lockedRef.current) {
      return;
    }

    lockedRef.current = true;

    const correct = isCorrectArticle(
      currentWord,
      article
    );

    playSound(correct ? "success" : "error");
    playHaptic(correct ? "success" : "error");

    setSelectedArticle(article);

    setStreak((previous) =>
      correct ? previous + 1 : 0
    );

    const delay = correct
      ? CORRECT_DELAY
      : INCORRECT_DELAY;

    timeoutRef.current = setTimeout(() => {
      setWordIndex((previous) =>
        nextWarmupIndex(previous)
      );

      setSelectedArticle(null);

      lockedRef.current = false;

      timeoutRef.current = undefined;
    }, delay);
  }

  return (
    <section
      aria-label="German article warm-up"
      className="
        relative w-full overflow-hidden
        rounded-2xl border
        border-[var(--wm-border)]
        bg-[var(--wm-surface)]
        p-4 shadow-xl
      "
    >
      {/* Header */}
      <div
        className="
          flex items-start justify-between
          gap-2
        "
      >
        <h2
          className={`
            ${mono.className}
            flex items-center gap-1.5
            text-[10px] font-bold
            uppercase tracking-wider
            text-[var(--wm-amber-light)]
          `}
        >
          <span aria-hidden="true">🔥</span>
          Warm-Up Challenge
        </h2>

        <div
          className="
            shrink-0 rounded-md border
            border-[var(--wm-border)]
            bg-[var(--wm-surface-raised)]
            px-2 py-1
          "
        >
          <span
            className={`${mono.className}
              text-[11px] text-gray-400`}
          >
            Streak:{" "}
            <span
              className="font-bold text-amber-400"
              aria-label={`${streak} correct in a row`}
            >
              {streak}
            </span>
          </span>
        </div>
      </div>

      {/* German noun */}
      <div className="py-5 text-center">
        <p className="mb-2 text-xs text-gray-400">
          {currentWord.english}
        </p>

        <div
          className="
            flex items-center justify-center
            gap-3 text-2xl font-extrabold
            tracking-wide
          "
        >
          <span
            className={
              !hasAnswered
                ? "text-amber-400 underline decoration-2 underline-offset-4"
                : wasCorrect
                  ? "text-emerald-400"
                  : "text-rose-400"
            }
          >
            {hasAnswered
              ? currentWord.article.toUpperCase()
              : "___"}
          </span>

          <span className="text-white">
            {currentWord.noun}
          </span>
        </div>
      </div>

      {/* Article selection */}
      <div
        role="group"
        aria-label={`Choose the correct article for ${currentWord.noun}`}
        className="grid grid-cols-3 gap-2"
      >
        {ARTICLES.map((item) => {
          const isChosen =
            selectedArticle === item.article;

          let selectedStyles =
            "border-[#3A425A] bg-[var(--wm-surface-raised)]";

          if (isChosen && wasCorrect) {
            selectedStyles =
              "border-emerald-400 bg-emerald-500/10";
          } else if (isChosen && !wasCorrect) {
            selectedStyles =
              "border-rose-400 bg-rose-500/10";
          }

          return (
            <button
              key={item.article}
              type="button"
              disabled={hasAnswered}
              onClick={() =>
                handleArticleSelection(item.article)
              }
              className={`
                flex min-h-14 min-w-0
                flex-col items-center
                justify-center gap-1
                rounded-xl border
                px-1 py-2
                text-center
                transition-[background-color,border-color,transform]
                duration-150
                ${selectedStyles}
                enabled:hover:border-amber-500/60
                motion-safe:enabled:active:scale-95
                motion-reduce:transition-none
                disabled:cursor-default
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-amber-400
              `}
            >
              <span
                className={`
                  ${mono.className}
                  text-[9px] font-bold
                  tracking-wide
                `}
                style={{
                  color: item.color,
                }}
              >
                {item.gender}
              </span>

              <span
                className="
                  text-sm font-extrabold
                  text-gray-100
                "
              >
                {item.article.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Accessible feedback */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="
          mt-3 flex min-h-5
          items-center justify-center
          text-center text-xs font-semibold
        "
      >
        {hasAnswered ? (
          <p
            className={
              wasCorrect
                ? "text-emerald-400"
                : "text-rose-400"
            }
          >
            {wasCorrect
              ? `✓ Richtig! ${currentWord.article} ${currentWord.noun}`
              : `✗ Not quite! It's ${currentWord.article} ${currentWord.noun}`}
          </p>
        ) : (
          <p className="text-gray-500">
            Choose the correct German article
          </p>
        )}
      </div>

      {/* Optional shortcut */}
      <div className="mt-3 text-center">
        <a
          href="#difficulty-heading"
          className="
            text-[11px] text-gray-400
            underline underline-offset-4
            hover:text-amber-400
            focus-visible:outline-2
            focus-visible:outline-amber-400
          "
        >
          Skip to level selection
        </a>
      </div>
    </section>
  );
}
