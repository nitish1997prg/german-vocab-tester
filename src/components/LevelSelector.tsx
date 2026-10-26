
import type { GermanLevel } from "@/types/quiz";

interface LevelSelectorProps {
  onSelectLevel: (level: GermanLevel) => void;
}

const levels: GermanLevel[] = ["A1", "A2", "B1", "B2"];

export default function LevelSelector({
  onSelectLevel,
}: LevelSelectorProps) {
  return (
    <section className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold">
        Select your German level
      </h2>

      <div className="flex gap-4">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onSelectLevel(level)}
            className="rounded-lg border px-6 py-3 hover:bg-gray-100 hover:text-black"
          >
            {level}
          </button>
        ))}
      </div>
    </section>
  );
}
