
import { describe, expect, it } from "vitest";

import { buildQuestionReportMailto } from "./question-report";

import type { VocabularyQuestion } from "@/types/quiz";

const question: VocabularyQuestion = {
  id: "test-question-123",
  level: "B1",
  word: "die Voraussetzung",
  options: [
    "The prerequisite",
    "The experience",
    "The opportunity",
    "The relationship",
  ],
  correctOptionIndex: 0,
  explanation:
    "A Voraussetzung is a condition that must be met.",
};

describe("buildQuestionReportMailto", () => {
  it("creates a prefilled report email", () => {
    const href = buildQuestionReportMailto(
      question,
      1,
      "feedback@example.com"
    );

    expect(href).not.toBeNull();

    const url = new URL(href!);

    expect(url.protocol).toBe("mailto:");

    expect(
      url.searchParams.get("subject")
    ).toContain("Question Report");

    const body =
      url.searchParams.get("body") ?? "";

    expect(body).toContain("test-question-123");
    expect(body).toContain("B1");
    expect(body).toContain("die Voraussetzung");
    expect(body).toContain(
      "My answer: The experience"
    );
    expect(body).toContain(
      "Marked correct: The prerequisite"
    );
    expect(body).toContain(
      "A Voraussetzung is a condition"
    );
  });

  it("does not generate a link without an email", () => {
    expect(
      buildQuestionReportMailto(
        question,
        1,
        undefined
      )
    ).toBeNull();
  });
});
