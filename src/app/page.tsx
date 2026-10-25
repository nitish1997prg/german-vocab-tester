
"use client";

import { useState } from "react";

type GermanLevel = "A1" | "A2" | "B1" | "B2";

const levels: GermanLevel[] = ["A1", "A2", "B1", "B2"];

export default function Home() {
  const [selectedLevel, setSelectedLevel] =
    useState<GermanLevel | null>(null);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">
        German Vocabulary Tester
      </h1>

      <p>Select your German proficiency level</p>

      <div className="flex gap-4">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className="rounded-lg border px-6 py-3 hover:bg-gray-100 hover:text-black"
          >
            {level}
          </button>
        ))}
      </div>

      {selectedLevel && (
        <p>You selected: {selectedLevel}</p>
      )}
    </main>
  );
}
