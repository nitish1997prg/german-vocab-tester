
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  WARMUP_WORDS,
  isCorrectArticle,
  nextWarmupIndex,
} from "./article-warmup";

describe("German article warm-up", () => {
  it("contains words with valid articles", () => {
    expect(WARMUP_WORDS.length).toBeGreaterThan(0);

    for (const word of WARMUP_WORDS) {
      expect(["der", "die", "das"]).toContain(
        word.article
      );

      expect(word.noun.length).toBeGreaterThan(0);
      expect(word.english.length).toBeGreaterThan(0);
    }
  });

  it("accepts the correct article", () => {
    const word = {
      noun: "Kaffee",
      article: "der" as const,
      english: "the coffee",
    };

    expect(
      isCorrectArticle(word, "der")
    ).toBe(true);
  });

  it("rejects an incorrect article", () => {
    const word = {
      noun: "Sonne",
      article: "die" as const,
      english: "the sun",
    };

    expect(
      isCorrectArticle(word, "das")
    ).toBe(false);
  });

  it("advances through the word list", () => {
    expect(nextWarmupIndex(0)).toBe(1);
    expect(nextWarmupIndex(1)).toBe(2);
  });

  it("wraps around after the last word", () => {
    const lastIndex = WARMUP_WORDS.length - 1;

    expect(
      nextWarmupIndex(lastIndex)
    ).toBe(0);
  });
});
