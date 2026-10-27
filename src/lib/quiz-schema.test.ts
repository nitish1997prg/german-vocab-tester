
import { describe, expect, it } from "vitest";

import {
  VocabularyQuestionSchema,
  QuizBatchSchema,
} from "./quiz-schema";

const validQuestion = {
  id: "q-001",
  level: "A1",
  word: "der Apfel",
  options: ["Apple", "House", "Book", "Water"],
  correctOptionIndex: 0,
};



describe("VocabularyQuestionSchema", () => {
  it("accepts a valid vocabulary question", () => {
    const result =
      VocabularyQuestionSchema.safeParse(validQuestion);

    expect(result.success).toBe(true);
  });

  it("rejects an invalid CEFR level", () => {
    const invalidQuestion = {
      ...validQuestion,
      level: "C1",
    };

    const result =
      VocabularyQuestionSchema.safeParse(invalidQuestion);

    expect(result.success).toBe(false);
  });

  it("rejects fewer than four options", () => {
    const invalidQuestion = {
      ...validQuestion,
      options: ["Apple", "House", "Book"],
    };

    const result =
      VocabularyQuestionSchema.safeParse(invalidQuestion);

    expect(result.success).toBe(false);
  });

  it("rejects an invalid correct answer index", () => {
    const invalidQuestion = {
      ...validQuestion,
      correctOptionIndex: 5,
    };

    const result =
      VocabularyQuestionSchema.safeParse(invalidQuestion);

    expect(result.success).toBe(false);
  });

  it("rejects an empty German word", () => {
    const invalidQuestion = {
      ...validQuestion,
      word: "   ",
    };

    const result =
      VocabularyQuestionSchema.safeParse(invalidQuestion);

    expect(result.success).toBe(false);
  });
});



describe("QuizBatchSchema", () => {
  it("accepts a valid question batch", () => {
    const batch = {
      questions: [validQuestion],
    };

    const result = QuizBatchSchema.safeParse(batch);

    expect(result.success).toBe(true);
  });

  it("rejects an empty question batch", () => {
    const batch = {
      questions: [],
    };

    const result = QuizBatchSchema.safeParse(batch);

    expect(result.success).toBe(false);
  });

  it("rejects more than five questions", () => {
    const batch = {
      questions: Array.from({ length: 6 }, (_, index) => ({
        ...validQuestion,
        id: `q-${index}`,
      })),
    };

    const result = QuizBatchSchema.safeParse(batch);

    expect(result.success).toBe(false);
  });

  it("rejects a batch containing an invalid question", () => {
    const batch = {
      questions: [
        validQuestion,
        {
          ...validQuestion,
          options: ["Apple", "House"],
        },
      ],
    };

    const result = QuizBatchSchema.safeParse(batch);

    expect(result.success).toBe(false);
  });
});
