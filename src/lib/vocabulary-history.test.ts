
// @vitest-environment jsdom

import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { vi } from "vitest";

import {
  getRecentWords,
  rememberWord,
} from "./vocabulary-history";

beforeEach(() => {
  localStorage.clear();
});

describe("Vocabulary History", () => {
  it("remembers words for a level", () => {
    rememberWord("A1", "der Apfel");

    expect(getRecentWords("A1")).toEqual([
      "der Apfel",
    ]);
  });

  it("keeps histories separate by level", () => {
    rememberWord("A1", "der Apfel");
    rememberWord("B1", "die Gelegenheit");

    expect(getRecentWords("A1")).toEqual([
      "der Apfel",
    ]);

    expect(getRecentWords("B1")).toEqual([
      "die Gelegenheit",
    ]);
  });

  it("deduplicates normalized words", () => {
    rememberWord("A1", "der Apfel");
    rememberWord("A1", "Apfel");

    expect(getRecentWords("A1")).toHaveLength(1);
  });

  it("retains only the latest 60 words", () => {
    for (let i = 1; i <= 65; i++) {
      rememberWord("A1", `Testwort ${i}`);
    }

    const history = getRecentWords("A1");

    expect(history).toHaveLength(60);
    expect(history).not.toContain("Testwort 1");
    expect(history).toContain("Testwort 65");
  });

  it("handles corrupted storage", () => {
    localStorage.setItem(
      "vocab-history-A1",
      "{invalid-json"
    );

    expect(getRecentWords("A1")).toEqual([]);
  });

  it("expires vocabulary history after 24 hours", () => {
  const startTime = Date.now();

  const dateSpy = vi.spyOn(Date, "now");

  try {
    dateSpy.mockReturnValue(startTime);

    rememberWord("A1", "der Apfel");

    // Just before 24 hours: history still exists
    dateSpy.mockReturnValue(
      startTime + 24 * 60 * 60 * 1000 - 1
    );

    expect(getRecentWords("A1")).toEqual([
      "der Apfel",
    ]);

    // At 24 hours: history expires
    dateSpy.mockReturnValue(
      startTime + 24 * 60 * 60 * 1000
    );

    expect(getRecentWords("A1")).toEqual([]);
    expect(
      localStorage.getItem("vocab-history-A1")
    ).toBeNull();
  } finally {
    dateSpy.mockRestore();
  }
    });
});
