
"use client";

import {
  getHapticsEnabled,
  playHaptic,
  setHapticsEnabled,
  useHapticsEnabled,
} from "@/lib/haptics";

export default function HapticToggle() {
  const enabled = useHapticsEnabled();

  function handleToggle() {
    const nextValue = !getHapticsEnabled();

    setHapticsEnabled(nextValue);

    // Demonstrate the feature when enabled.
    if (nextValue) {
      playHaptic("tap");
    }
  }

  return (
    <button
      type="button"
      aria-label={
        enabled
          ? "Turn vibration off"
          : "Turn vibration on"
      }
      aria-pressed={enabled}
      title={
        enabled
          ? "Vibration on"
          : "Vibration off"
      }
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
      <span
        aria-hidden="true"
        className={enabled ? "" : "opacity-45"}
      >
        📳
      </span>
    </button>
  );
}
