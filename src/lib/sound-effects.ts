
"use client";

import { useSyncExternalStore } from "react";

export type SoundEffect =
  | "tap"
  | "success"
  | "error";

const STORAGE_KEY = "gvt:sound-enabled";
const CHANGE_EVENT = "gvt:sound-changed";

let audioContext: AudioContext | null = null;

export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function setSoundEnabled(
  enabled: boolean
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      enabled ? "on" : "off"
    );

    window.dispatchEvent(
      new Event(CHANGE_EVENT)
    );
  } catch {
    // Storage may be unavailable.
    // Keep the app functional without sound.
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

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    getSoundEnabled,
    () => false
  );
}

const PRESETS: Record<
  SoundEffect,
  {
    frequency: number;
    endFrequency: number;
    duration: number;
    volume: number;
    wave: OscillatorType;
  }
> = {
  tap: {
    frequency: 560,
    endFrequency: 740,
    duration: 0.055,
    volume: 0.025,
    wave: "sine",
  },

  success: {
    frequency: 620,
    endFrequency: 880,
    duration: 0.14,
    volume: 0.045,
    wave: "sine",
  },

  error: {
    frequency: 260,
    endFrequency: 190,
    duration: 0.16,
    volume: 0.035,
    wave: "triangle",
  },
};

export function playSound(
  effect: SoundEffect
): void {
  if (
    typeof window === "undefined" ||
    !getSoundEnabled() ||
    !window.AudioContext
  ) {
    return;
  }

  try {
    if (
      !audioContext ||
      audioContext.state === "closed"
    ) {
      audioContext = new AudioContext();
    }

    const context = audioContext;

    if (context.state === "suspended") {
      void context.resume().catch(() => {
        // Audio must never interrupt gameplay.
      });
    }

    const preset = PRESETS[effect];
    const now = context.currentTime;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = preset.wave;

    oscillator.frequency.setValueAtTime(
      preset.frequency,
      now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      preset.endFrequency,
      now + preset.duration
    );

    gain.gain.setValueAtTime(0.0001, now);

    gain.gain.exponentialRampToValueAtTime(
      preset.volume,
      now + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + preset.duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + preset.duration + 0.01);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  } catch {
    // Unsupported or blocked audio should fail silently.
  }
}
