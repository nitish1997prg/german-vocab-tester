
import { describe, expect, it } from "vitest";

import {
  normalizeGermanWord,
  filterUniqueQuestions,
} from "./quiz-uniqueness";

import type { VocabularyQuestion } from "@/types/quiz";

describe("normalizeGermanWord", () => {
  it("removes noun articles", () => {
    expect(normalizeGermanWord("der Apfel"))
      .toBe("apfel");

    expect(normalizeGermanWord("das Haus"))
      .toBe("haus");
  });

  it("normalizes casing and whitespace", () => {
    expect(normalizeGermanWord("  DER   APFEL  "))
      .toBe("apfel");
  });

  it("preserves meaningful umlauts", () => {
    expect(normalizeGermanWord("schon"))
      .not.toBe(normalizeGermanWord("schön"));
  });
});



describe("filterUniqueQuestions", () => {
  const questions: VocabularyQuestion[] = [
    {
      id: "1",
      level: "A1",
      word: "der Apfel",
      options: ["Apple", "House", "Book", "Water"],
      correctOptionIndex: 0,
    },
    {
      id: "2",
      level: "A1",
      word: "das Haus",
      options: ["Book", "House", "Water", "Apple"],
      correctOptionIndex: 1,
    },
    {
      id: "3",
      level: "A1",
      word: "Der Apfel",
      options: ["Water", "House", "Apple", "Book"],
      correctOptionIndex: 2,
    },
  ];

  it("removes duplicates within the batch", () => {
    const result = filterUniqueQuestions(
      questions,
      [],
      "A1"
    );

    expect(result).toHaveLength(2);
    expect(result.map((q) => q.word)).toEqual([
      "der Apfel",
      "das Haus",
    ]);
  });

  it("excludes previously used words", () => {
    const result = filterUniqueQuestions(
      questions,
      ["APFEL"],
      "A1"
    );

    expect(result).toHaveLength(1);
    expect(result[0].word).toBe("das Haus");
  });

  it("rejects questions from another level", () => {
    const result = filterUniqueQuestions(
      questions,
      [],
      "B1"
    );

    expect(result).toHaveLength(0);
  });

  it("does not mutate the input array", () => {
    const originalWords = questions.map((q) => q.word);

    filterUniqueQuestions(questions, [], "A1");

    expect(questions.map((q) => q.word))
      .toEqual(originalWords);
  });
});
