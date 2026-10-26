
import { useState } from "react";
import type { GermanLevel } from "@/types/quiz";

interface LevelSelectorProps {
  onSelectLevel: (level: GermanLevel) => void;
}

const levels: {
  id: GermanLevel;
  description: string;
}[] = [
  { id: "A1", description: "Beginner" },
  { id: "A2", description: "Elementary" },
  { id: "B1", description: "Intermediate" },
  { id: "B2", description: "Upper intermediate" },
];

export default function LevelSelector({
  onSelectLevel,
}: LevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] =
    useState<GermanLevel | null>(null);

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          Choose your level
        </h2>

        <p className="text-sm text-[var(--muted)]">
          How good is your German?
          Pick a level to get started.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.id;

          return (
            <button
              key={level.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedLevel(level.id)}
              className={`
                flex min-h-28 flex-col items-start
                justify-center gap-2 rounded-xl
                border-2 p-4 text-left
                motion-safe:transition-colors motion-safe:duration-150
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[var(--primary)]
                ${
                  isSelected
                    ? "border-[var(--primary)] bg-[#E4F3EC]"
                    : "border-[var(--border)] bg-white hover:bg-[#F3F8F5]"
                }
              `}
            >
              <span className="text-2xl font-bold">
                {level.id}
              </span>

              <span className="text-xs text-[var(--muted)]">
                {level.description}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={selectedLevel === null}
        onClick={() => {
          if (selectedLevel !== null) {
            onSelectLevel(selectedLevel);
          }
        }}
        className="
          w-full rounded-xl bg-[var(--primary)]
          px-6 py-4 font-semibold text-white
          motion-safe:transition-colors motion-safe:duration-150
          hover:bg-[#115740]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[var(--primary)]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        Start Challenge →
      </button>

      <p className="text-center text-xs text-[var(--muted)]">
        One wrong answer and it&apos;s game over!
      </p>
    </section>
  );
}
