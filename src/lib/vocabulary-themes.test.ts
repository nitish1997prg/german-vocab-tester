
import { describe, expect, it } from "vitest";

import {
  selectVocabularyThemes,
  VOCABULARY_THEMES,
} from "./vocabulary-themes";

import type { GermanLevel } from "@/types/quiz";

const levels: GermanLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
];

describe("selectVocabularyThemes", () => {
  it.each(levels)(
    "selects two valid themes for %s",
    (level) => {
      const themes = selectVocabularyThemes(level);

      expect(themes).toHaveLength(2);

      for (const theme of themes) {
        expect(VOCABULARY_THEMES[level]).toContain(theme);
      }
    }
  );

  it("does not select duplicate themes", () => {
    for (const level of levels) {
      const themes = selectVocabularyThemes(level);

      expect(new Set(themes).size).toBe(2);
    }
  });

  it("does not modify the original theme pool", () => {
    const original = [...VOCABULARY_THEMES.A1];

    selectVocabularyThemes("A1", () => 0);

    expect(VOCABULARY_THEMES.A1).toEqual(original);
  });

  it("supports deterministic randomization in tests", () => {
    const first = selectVocabularyThemes("B1", () => 0);
    const second = selectVocabularyThemes("B1", () => 0);

    expect(first).toEqual(second);
  });
});
