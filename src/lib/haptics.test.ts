
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  getHapticsEnabled,
  setHapticsEnabled,
  playHaptic,
} from "./haptics";

const values = new Map<string, string>();
const vibrate = vi.fn(() => true);

function setupBrowser(reducedMotion = false) {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) =>
        values.get(key) ?? null,

      setItem: (
        key: string,
        value: string
      ) => {
        values.set(key, value);
      },
    },

    navigator: {
      vibrate,
    },

    matchMedia: () => ({
      matches: reducedMotion,
    }),

    dispatchEvent: vi.fn(),
  });
}

afterEach(() => {
  values.clear();
  vibrate.mockClear();
  vi.unstubAllGlobals();
});

describe("Haptic feedback", () => {
  it("is disabled by default", () => {
    setupBrowser();

    expect(getHapticsEnabled()).toBe(false);

    playHaptic("success");

    expect(vibrate).not.toHaveBeenCalled();
  });

  it("vibrates when enabled", () => {
    setupBrowser();

    setHapticsEnabled(true);
    playHaptic("success");

    expect(vibrate).toHaveBeenCalledWith([25]);
  });

  it("uses a distinct error pattern", () => {
    setupBrowser();

    setHapticsEnabled(true);
    playHaptic("error");

    expect(vibrate).toHaveBeenCalledWith([
      18,
      45,
      18,
    ]);
  });

  it("does not vibrate when disabled", () => {
    setupBrowser();

    setHapticsEnabled(true);
    setHapticsEnabled(false);

    playHaptic("tap");

    expect(vibrate).not.toHaveBeenCalled();
  });

  it("respects reduced motion", () => {
    setupBrowser(true);

    setHapticsEnabled(true);
    playHaptic("success");

    expect(vibrate).not.toHaveBeenCalled();
  });
});
