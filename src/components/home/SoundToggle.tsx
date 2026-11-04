
"use client";

import {
  playSound,
  setSoundEnabled,
  useSoundEnabled,
} from "@/lib/sound-effects";

export default function SoundToggle() {
  const enabled = useSoundEnabled();

  function handleToggle() {
    const nextValue = !enabled;

    setSoundEnabled(nextValue);

    if (nextValue) {
      playSound("tap");
    }
  }

  return (
    <button
      type="button"
      aria-label={
        enabled
          ? "Turn sound off"
          : "Turn sound on"
      }
      aria-pressed={enabled}
      title={enabled ? "Sound on" : "Sound off"}
      onClick={handleToggle}
      className={`
        flex h-10 w-10 shrink-0
        items-center justify-center
        rounded-xl border
        bg-[var(--wm-surface)]
        text-lg transition-colors
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-amber-400
        ${
          enabled
            ? "border-amber-500 text-amber-400"
            : "border-[var(--wm-border)] text-gray-400"
        }
      `}
    >
      <span aria-hidden="true">
        {enabled ? "🔊" : "🔇"}
      </span>
    </button>
  );
}
