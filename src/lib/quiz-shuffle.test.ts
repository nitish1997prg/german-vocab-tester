
import { describe, expect, it } from "vitest";

import { shuffleQuestionOptions } from "./quiz-shuffle";

import type {
  VocabularyQuestion,
  OptionIndex,
} from "@/types/quiz";

const question: VocabularyQuestion = {
  id: "q-001",
  level: "B1",
  word: "Geschäftsführer",
  options: [
    "Employee",
    "Manager",
    "Customer",
    "Salesperson",
  ],
  correctOptionIndex: 1,
};

describe("shuffleQuestionOptions", () => {
  it("preserves all four options", () => {
    const result = shuffleQuestionOptions(
      question,
      () => 0
    );

    expect([...result.options].sort()).toEqual(
      [...question.options].sort()
    );
  });

  it("keeps the correct answer after shuffling", () => {
    const result = shuffleQuestionOptions(
      question,
      () => 0
    );

    expect(
      result.options[result.correctOptionIndex]
    ).toBe("Manager");
  });

  it("can change the correct answer position", () => {
    const result = shuffleQuestionOptions(
      question,
      () => 0
    );

    expect(result.correctOptionIndex).not.toBe(
      question.correctOptionIndex
    );
  });

  it("does not mutate the original question", () => {
    const originalOptions = [...question.options];

    shuffleQuestionOptions(question, () => 0);

    expect(question.options).toEqual(originalOptions);
    expect(question.correctOptionIndex).toBe(1);
  });

  it("preserves correctness for every original index", () => {
    for (
      let index = 0 as OptionIndex;
      index < 4;
      index++
    ) {
      const input: VocabularyQuestion = {
        ...question,
        correctOptionIndex: index,
      };

      const result = shuffleQuestionOptions(
        input,
        () => 0
      );

      expect(
        result.options[result.correctOptionIndex]
      ).toBe(input.options[index]);
    }
  });
});
