
"use client";

import { useEffect, useState } from "react";

interface CompoundWordFactoryLoaderProps {
  active: boolean;
}

const CYCLE_DURATION = 3600;

const WORD_PAIRS = [
  {
    left: "Kaffee",
    right: "Tasse",
    result: "Kaffeetasse",
    meaning: "Coffee cup",
  },
  {
    left: "Wort",
    right: "Schatz",
    result: "Wortschatz",
    meaning: "Vocabulary",
  },
  {
    left: "Zahn",
    right: "Bürste",
    result: "Zahnbürste",
    meaning: "Toothbrush",
  },
  {
    left: "Hand",
    right: "Schuh",
    result: "Handschuh",
    meaning: "Glove",
  },
  {
    left: "Regen",
    right: "Schirm",
    result: "Regenschirm",
    meaning: "Umbrella",
  },
] as const;

export default function CompoundWordFactoryLoader({
  active,
}: CompoundWordFactoryLoaderProps) {
  const [pairIndex, setPairIndex] = useState(0);

  const currentPair = WORD_PAIRS[pairIndex];

  // Rotate the displayed word pair.
  // This timer never controls quiz loading.
  useEffect(() => {
    if (!active) return;

    const interval = window.setInterval(() => {
      setPairIndex(
        (previous) =>
          (previous + 1) % WORD_PAIRS.length
      );
    }, CYCLE_DURATION);

    return () => {
      window.clearInterval(interval);
    };
  }, [active]);

  return (
    <section
      aria-label="Compound Word Factory loading animation"
      aria-hidden={!active}
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-[var(--wm-canvas)]
        px-4 py-4
        transition-opacity duration-200
        motion-reduce:transition-none
        ${
          active
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }
      `}
    >
      <div
        className="
          flex w-full max-w-md
          flex-col gap-5
          rounded-2xl border
          border-[var(--wm-border)]
          bg-[var(--wm-surface)]
          p-5 shadow-2xl
        "
      >
        {/* Header */}
        <header className="flex items-center gap-3">
          <div
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-xl
              border border-amber-500/30
              bg-amber-500/10
              text-xl
            "
            aria-hidden="true"
          >
            ⚙️
          </div>

          <div>
            <h2
              className="
                text-sm font-black
                uppercase tracking-widest
                text-amber-400
              "
            >
              Wort-Fabrik
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              The German Word Factory
            </p>
          </div>
        </header>

        {/* Factory assembly stage */}
        <div
          className="
            wm-factory-board
            relative h-60 w-full
            overflow-hidden rounded-xl
            border border-[var(--wm-border)]
            bg-[#11151F]
          "
          aria-hidden="true"
        >
          {/* Station label */}
          <div
            className="
              absolute left-3 top-3
              rounded-md border
              border-[#3A425A]
              bg-[#1C2230]/90
              px-2 py-1
              text-[9px] font-bold
              tracking-widest text-gray-400
            "
          >
            ASSEMBLY STATION 01
          </div>

          {/* Decorative status light */}
          <div
            className="
              absolute right-4 top-4
              h-2 w-2 rounded-full
              bg-emerald-400
              shadow-[0_0_12px_rgba(52,211,153,0.6)]
            "
          />

          {/* Animated scene */}
          <div
            key={`${pairIndex}-${active}`}
            className="absolute inset-0"
            style={{
              animationPlayState: active
                ? "running"
                : "paused",
            }}
          >
            {/* Separate word blocks */}
            <div
              className="
                absolute inset-x-2 top-[38%]
                flex -translate-y-1/2
                items-center justify-center
                gap-2
              "
            >
              <div
                className="
                  wm-factory-left
                  rounded-lg border
                  border-amber-500/60
                  bg-amber-500/15
                  px-3 py-3
                  text-[13px] font-extrabold
                  text-amber-300
                  shadow-lg
                "
                lang="de"
              >
                {currentPair.left}
              </div>

              <span
                className="wm-factory-plus text-sm font-bold text-gray-500"
              >
                +
              </span>

              <div
                className="
                  wm-factory-right
                  rounded-lg border
                  border-blue-500/60
                  bg-blue-500/15
                  px-3 py-3
                  text-[13px] font-extrabold
                  text-blue-300
                  shadow-lg
                "
                lang="de"
              >
                {currentPair.right}
              </div>
            </div>

            {/* Fusion spark */}
            <div
              className="
                pointer-events-none
                absolute inset-x-0 top-[38%]
                flex -translate-y-1/2
                items-center justify-center
              "
            >
              <div className="wm-factory-spark relative flex h-20 w-20 items-center justify-center">
                <div
                  className="
                    absolute inset-2 rounded-full
                    bg-amber-400/30 blur-xl
                  "
                />

                <div
                  className="
                    absolute inset-4 rounded-full
                    border-2 border-amber-400/70
                  "
                />

                <span
                  className="
                    relative text-4xl
                    text-amber-300
                    drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]
                  "
                >
                  ✦
                </span>
              </div>
            </div>

            {/* Fused compound word */}
            <div
              className="
                pointer-events-none
                absolute inset-x-3 top-[38%]
                flex -translate-y-1/2
                items-center justify-center
              "
            >
              <div
                className="
                  wm-factory-result
                  max-w-full break-words
                  rounded-xl border
                  border-indigo-400/70
                  bg-gradient-to-r
                  from-amber-500/25
                  via-indigo-500/25
                  to-blue-500/25
                  px-4 py-3 text-center
                  text-lg font-black
                  text-white shadow-xl
                "
                lang="de"
              >
                {currentPair.result}
              </div>
            </div>
          </div>

          {/* Conveyor belt */}
          <div
            className="
              absolute bottom-11 left-3 right-3
              h-4 overflow-hidden rounded
              border-y border-slate-600/50
              bg-[#242C3A]
            "
            aria-hidden="true"
          >
            <div className="wm-factory-track h-full w-full" />
          </div>

          {/* Conveyor rollers */}
          <div
            className="
              absolute bottom-4 left-5 right-5
              flex items-center justify-between
            "
            aria-hidden="true"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="
                  wm-factory-roller
                  flex h-4 w-4
                  items-center justify-center
                  rounded-full border-2
                  border-slate-600
                  bg-slate-900
                "
              >
                <span className="h-1 w-1 rounded-full bg-amber-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Word explanation */}
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold text-gray-100">
            Building{" "}
            <span className="text-amber-400" lang="de">
              {currentPair.result}
            </span>
          </p>

          <p className="text-xs text-gray-400">
            {currentPair.left} + {currentPair.right}
            {" = "}
            {currentPair.meaning}
          </p>
        </div>

        {/* Real API loading status */}
        <div
          role="status"
          aria-live="polite"
          className="space-y-2 text-center"
        >
          <p className="text-xs font-medium text-gray-300">
            Preparing your vocabulary challenge...
          </p>

          <div
            className="
              h-1.5 w-full overflow-hidden
              rounded-full bg-[#2A2F3D]
            "
            aria-hidden="true"
          >
            <div
              className="
                wm-factory-progress
                h-full w-1/3
                rounded-full bg-amber-400
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}
