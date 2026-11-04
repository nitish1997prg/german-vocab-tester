
import { notFound } from "next/navigation";
import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
});

const levels = [
  {
    id: "A1",
    german: "Anfänger",
    name: "Beginner",
    description: "Everyday basics & essentials",
    accent: "#10b981",
  },
  {
    id: "A2",
    german: "Grundlagen",
    name: "Elementary",
    description: "Common phrases & routines",
    accent: "#22d3ee",
  },
  {
    id: "B1",
    german: "Mittelstufe",
    name: "Intermediate",
    description: "Travel, work & conversations",
    accent: "#818cf8",
  },
  {
    id: "B2",
    german: "Fortgeschritten",
    name: "Upper-intermediate",
    description: "Complex debates & media",
    accent: "#f59e0b",
  },
];

export default function ThemePreviewPage() {
  // This design preview is only accessible locally.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main
      className={`${jakarta.className} relative min-h-dvh overflow-hidden bg-[var(--wm-canvas)] text-[var(--wm-text)]`}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
        {/* Utility bar */}
        <header>
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-3 py-2 text-[11px] font-bold tracking-wider text-gray-300">
              <span className="mr-2 text-emerald-400">
                ●
              </span>
              DEUTSCH v1.0
            </span>

            <div className="flex gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--wm-border)] bg-[var(--wm-surface)] text-gray-400">
                ♪
              </span>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--wm-border)] bg-[var(--wm-surface)] text-gray-400">
                ↻
              </span>
            </div>
          </div>

          {/* Brand header */}
          <div className="mt-7">
            <p
              className={`${mono.className} mb-2 text-xs font-bold tracking-[0.18em] text-[var(--wm-amber)]`}
            >
              ⚡ GUTEN TAG
            </p>

            <h1 className="text-4xl font-extrabold tracking-tight">
              Wortmeister
              <span className="text-[var(--wm-amber)]">
                .
              </span>
            </h1>

            <p className="mt-2 text-xs italic text-gray-400">
              &quot;Übung macht den Meister!&quot;
            </p>

            <p className="mt-1 text-[11px] text-gray-500">
              Practice makes perfect
            </p>
          </div>
        </header>

        {/* Warm-up visual preview */}
        <section className="mt-7 rounded-2xl border border-[var(--wm-border)] bg-[var(--wm-surface)] p-4 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`${mono.className} text-[10px] font-bold tracking-wide text-[var(--wm-amber-light)]`}
            >
              🔥 WARM-UP CHALLENGE
            </span>

            <span className="rounded-md bg-[var(--wm-surface-raised)] px-2 py-1 text-[10px] text-gray-400">
              Streak: 0
            </span>
          </div>

          <div className="py-5 text-center">
            <p className="mb-2 text-xs text-gray-400">
              the coffee
            </p>

            <div className="flex items-center justify-center gap-3 text-2xl font-extrabold">
              <span className="text-[var(--wm-amber)] underline decoration-2 underline-offset-4">
                ___
              </span>
              <span>Kaffee</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                article: "DER",
                gender: "MASCULINE",
                color: "#3b82f6",
              },
              {
                article: "DIE",
                gender: "FEMININE",
                color: "#ec4899",
              },
              {
                article: "DAS",
                gender: "NEUTER",
                color: "#f59e0b",
              },
            ].map((item) => (
              <div
                key={item.article}
                className="rounded-xl border border-[#3a425a] bg-[var(--wm-surface-raised)] px-2 py-3 text-center"
              >
                <p
                  className={`${mono.className} text-[9px] font-bold`}
                  style={{ color: item.color }}
                >
                  {item.gender}
                </p>

                <p className="mt-1 text-sm font-extrabold">
                  {item.article}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Level selection */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2
              className={`${mono.className} text-[10px] font-bold uppercase tracking-widest text-gray-400`}
            >
              Select Difficulty Level
            </h2>

            <span className="text-[10px] text-gray-500">
              CEFR Standard
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {levels.map((level) => {
              const selected = level.id === "A1";

              return (
                <div
                  key={level.id}
                  className={`relative min-h-35 rounded-2xl border p-3.5 ${
                    selected
                      ? "border-amber-500 bg-[var(--wm-surface-raised)] shadow-[0_0_20px_-3px_rgba(245,158,11,0.25)]"
                      : "border-[var(--wm-border)] bg-[var(--wm-surface)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span
                      className={`${mono.className} text-xl font-extrabold`}
                    >
                      {level.id}
                    </span>

                    <span
                      className="rounded-full bg-[#272d3e] px-2 py-1 text-[9px] font-semibold"
                      style={{
                        color: level.accent,
                      }}
                    >
                      {level.german}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xs font-bold">
                    {level.name}
                  </h3>

                  <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                    {level.description}
                  </p>

                  {selected && (
                    <span
                      className={`${mono.className} mt-3 block text-[10px] font-bold text-amber-400`}
                    >
                      ● SELECTED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to action — visual only */}
        <footer className="mt-auto pt-7">
          <div className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-sm font-extrabold tracking-wide text-[#0f1117] shadow-[0_8px_30px_-10px_rgba(245,158,11,0.45)]">
            START A1 CHALLENGE
            <span aria-hidden="true">→</span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--wm-border)] py-4 text-[11px] text-gray-500">
            <span>Privacy Policy</span>
            <span>No account required</span>
          </div>

          <p className="text-center text-[10px] text-gray-600">
            Local design preview — no active gameplay
          </p>
        </footer>
      </div>
    </main>
  );
}
