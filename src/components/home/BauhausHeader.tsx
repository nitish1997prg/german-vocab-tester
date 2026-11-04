
"use client";

import { useSyncExternalStore } from "react";
import { mono } from "@/lib/fonts";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return "GUTEN MORGEN";
  }

  if (hour >= 11 && hour < 18) {
    return "GUTEN TAG";
  }

  if (hour >= 18 && hour < 22) {
    return "GUTEN ABEND";
  }

  return "HALLO NACHTEULE";
}

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);

  return () => window.clearInterval(interval);
}

export default function BauhausHeader() {
  const greeting = useSyncExternalStore(
    subscribeToClock,
    getGreeting,
    () => "GUTEN TAG"
  );

  return (
    <header className="space-y-7">
      {/* Top utility bar */}
      <div className="flex items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-2
                     rounded-full border
                     border-[var(--wm-border)]
                     bg-[var(--wm-surface)]
                     px-3 py-2"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full
                       bg-[var(--wm-green)]
                       motion-safe:animate-pulse"
          />

          <span
            className={`${mono.className}
              text-[10px] font-bold tracking-wider
              text-gray-300`}
          >
            DEUTSCH · A1–B2
          </span>
        </div>

        <span
          className={`${mono.className}
            text-[10px] text-gray-400`}
        >
          20 QUESTIONS
        </span>
      </div>

      {/* Branding */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="text-sm text-[var(--wm-amber)]"
          >
            ⚡
          </span>

          <p
            className={`${mono.className}
              text-[11px] font-bold uppercase
              tracking-[0.18em]
              text-[var(--wm-amber)]`}
          >
            {greeting}
          </p>
        </div>

        <h1
          className="text-[clamp(1.9rem,8vw,2.5rem)]
                     font-extrabold leading-tight
                     tracking-tight text-white"
        >
          German Vocab
          <span className="text-[var(--wm-amber)]">
            .
          </span>
        </h1>

        <p className="mt-3 text-xs italic text-gray-400">
          &bdquo;Übung macht den Meister!&ldquo;
        </p>

        <p className="mt-1 text-[11px] text-gray-500">
          Practice makes perfect
        </p>
      </div>
    </header>
  );
}
