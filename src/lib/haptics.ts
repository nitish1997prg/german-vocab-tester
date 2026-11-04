
"use client";

import { useSyncExternalStore } from "react";

export type HapticEffect =
  | "tap"
  | "success"
  | "error";

const STORAGE_KEY = "gvt:haptics-enabled";
const CHANGE_EVENT = "gvt:haptics-changed";

const HAPTIC_PATTERNS: Record<
  HapticEffect,
  number[]
> = {
  tap: [12],
  success: [25],
  error: [18, 45, 18],
};

export function getHapticsEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) ===
      "on"
    );
  } catch {
    return false;
  }
}

export function setHapticsEnabled(
  enabled: boolean
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      enabled ? "on" : "off"
    );

    window.dispatchEvent(
      new Event(CHANGE_EVENT)
    );
  } catch {
    // Keep the app functional if storage
    // is unavailable.
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      onChange
    );

    window.removeEventListener(
      "storage",
      onChange
    );
  };
}

export function useHapticsEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    getHapticsEnabled,
    () => false
  );
}

export function playHaptic(
  effect: HapticEffect
): void {
  if (
    typeof window === "undefined" ||
    !getHapticsEnabled()
  ) {
    return;
  }

  try {
    // Respect the user's accessibility preference.
    if (
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    const vibrate = window.navigator.vibrate;

    if (typeof vibrate !== "function") {
      return;
    }

    vibrate.call(
      window.navigator,
      HAPTIC_PATTERNS[effect]
    );
  } catch {
    // Unsupported hardware or browser restrictions
    // must never interfere with gameplay.
  }
}
