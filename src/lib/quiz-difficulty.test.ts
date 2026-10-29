
import { describe, expect, it } from "vitest";

import {
  getQuestionDifficulty,
  MAX_QUESTIONS_PER_GAME, shuffleQuestionsWithinDifficulty
} from "./quiz-difficulty";

describe("getQuestionDifficulty", () => {
  it.each([
    [1, "warmup"],
    [5, "warmup"],
    [6, "standard"],
    [10, "standard"],
    [11, "hard"],
    [15, "hard"],
    [16, "challenge"],
    [20, "challenge"],
  ] as const)(
    "maps question %i to %s",
    (questionNumber, expected) => {
      expect(
        getQuestionDifficulty(questionNumber)
      ).toBe(expected);
    }
  );

  it("rejects invalid question numbers", () => {
    for (const number of [0, 21, -1, 1.5]) {
      expect(() =>
        getQuestionDifficulty(number)
      ).toThrow(RangeError);
    }
  });

  it("uses a 20-question challenge", () => {
    expect(MAX_QUESTIONS_PER_GAME).toBe(20);
  });

  
  it("shuffles questions only within difficulty groups", () => {
    const questions = Array.from(
      { length: 10 },
      (_, index) => ({
        id: `q-${index + 1}`,
        level: "B1" as const,
        word: `Testwort ${index + 1}`,
        options: [
          "Answer",
          "Option B",
          "Option C",
          "Option D",
        ] as [string, string, string, string],
        correctOptionIndex: 0 as const,
      })
    );

    const result = shuffleQuestionsWithinDifficulty(
      questions,
      1,
      () => 0
    );

    // Questions 1–5 stay within the warm-up group
    expect(
      result.slice(0, 5).map((q) => q.id).sort()
    ).toEqual(
      questions.slice(0, 5).map((q) => q.id).sort()
    );

    // Questions 6–10 stay within the standard group
    expect(
      result.slice(5, 10).map((q) => q.id).sort()
    ).toEqual(
      questions.slice(5, 10).map((q) => q.id).sort()
    );

    // Order changes within at least one group
    expect(result.map((q) => q.id)).not.toEqual(
      questions.map((q) => q.id)
    );
  });

});
