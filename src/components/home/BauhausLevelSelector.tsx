
"use client";

import { useState } from "react";

import type { GermanLevel } from "@/types/quiz";
import { mono } from "@/lib/fonts";

type Props = {
  onSelectLevel: (
    level: GermanLevel
  ) => void | Promise<void>;
};

type LevelConfig = {
  id: GermanLevel;
  german: string;
  name: string;
  description: string;
  accent: string;
};

const LEVELS: LevelConfig[] = [
  {
    id: "A1",
    german: "Anfänger",
    name: "Beginner",
    description: "Everyday basics & essentials",
    accent: "#10B981",
  },
  {
    id: "A2",
    german: "Grundlagen",
    name: "Elementary",
    description: "Common phrases & routines",
    accent: "#22D3EE",
  },
  {
    id: "B1",
    german: "Mittelstufe",
    name: "Intermediate",
    description: "Travel, work & conversations",
    accent: "#818CF8",
  },
  {
    id: "B2",
    german: "Fortgeschritten",
    name: "Upper-intermediate",
    description: "Complex debates & media",
    accent: "#F59E0B",
  },
];

export default function BauhausLevelSelector({
  onSelectLevel,
}: Props) {
  const [selectedLevel, setSelectedLevel] =
    useState<GermanLevel>("A1");

  function handleStartChallenge() {
    void onSelectLevel(selectedLevel);
  }

  return (
    <section
      className="w-full space-y-4"
      aria-labelledby="difficulty-heading"
    >
      {/* Section heading */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2
          id="difficulty-heading"
          className={`${mono.className}
            text-[11px] font-bold uppercase
            tracking-wider text-gray-400`}
        >
          Select Difficulty Level
        </h2>

        <span className="shrink-0 text-[10px] text-gray-500">
          CEFR Standard
        </span>
      </div>

      {/* Level cards */}
      <div
        role="group"
        aria-label="German proficiency levels"
        className="grid grid-cols-2 gap-3"
      >
        {LEVELS.map((level) => {
          const isSelected =
            selectedLevel === level.id;

          return (
            <button
              key={level.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedLevel(level.id)}
              className={`
                relative flex min-h-[158px] min-w-0
                flex-col rounded-2xl border
                p-3.5 text-left
                transition-[background-color,border-color,box-shadow,transform]
                duration-200
                motion-safe:active:scale-[0.98]
                motion-reduce:transition-none
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-amber-400

                ${
                  isSelected
                    ? `
                      border-amber-500
                      bg-[var(--wm-surface-raised)]
                      shadow-[0_0_20px_-3px_rgba(245,158,11,0.25)]
                    `
                    : `
                      border-[var(--wm-border)]
                      bg-[var(--wm-surface)]
                      hover:border-[#3A425A]
                    `
                }
              `}
            >
              {/* Level and German label */}
              <div className="flex w-full flex-wrap items-center justify-between gap-1">
                <span
                  className={`${mono.className}
                    text-xl font-extrabold text-white`}
                >
                  {level.id}
                </span>

                <span
                  className="rounded-full bg-[#272D3E]
                             px-2 py-1 text-[10px]
                             font-bold leading-tight"
                  style={{ color: level.accent }}
                >
                  {level.german}
                </span>
              </div>

              {/* Description */}
              <div className="mt-3">
                <h3 className="text-sm font-bold text-gray-100">
                  {level.name}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  {level.description}
                </p>
              </div>

              {/* Selected indicator */}
              <div className="mt-auto pt-3">
                {isSelected && (
                  <span
                    className={`${mono.className}
                      text-[10px] font-bold
                      tracking-wide text-amber-400`}
                  >
                    ● SELECTED
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Start Challenge CTA */}
      <button
        type="button"
        onClick={handleStartChallenge}
        className="
          mt-5 flex min-h-14 w-full
          items-center justify-center gap-3
          rounded-2xl bg-gradient-to-r
          from-amber-500 to-amber-600
          px-5 py-4
          text-sm font-extrabold tracking-wide
          text-[#0F1117]
          shadow-[0_8px_30px_-10px_rgba(245,158,11,0.45)]
          transition-[filter,transform] duration-200
          hover:brightness-110
          motion-safe:active:scale-[0.98]
          motion-reduce:transition-none
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-amber-400
        "
      >
        <span>
          START {selectedLevel} CHALLENGE
        </span>

        <span aria-hidden="true" className="text-xl">
          →
        </span>
      </button>
    </section>
  );
}
