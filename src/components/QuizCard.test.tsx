
// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import QuizCard from "./QuizCard";
import type { VocabularyQuestion } from "@/types/quiz";

afterEach(cleanup);

const question: VocabularyQuestion = {
  id: "test-question",
  level: "A1",
  word: "der Apfel",
  options: ["Apple", "House", "Water", "Book"],
  correctOptionIndex: 0,
};

function renderQuizCard(
  score: number,
  selectedOptionIndex: number | null
) {
  return render(
    <QuizCard
      question={question}
      score={score}
      selectedOptionIndex={selectedOptionIndex}
      onSelectOption={vi.fn()}
      onNextQuestion={vi.fn()}
    />
  );
}

describe("QuizCard streak milestones", () => {
  it.each([
    [5, /5 in a row!/i],
    [10, /10 in a row!/i],
    [15, /15 in a row!/i],
  ])(
    "shows the celebration at score %i",
    (score, message) => {
      renderQuizCard(score, 0);

      expect(screen.getByText(message)).toBeTruthy();

      expect(
        screen.getByText("Correct! +1 point")
      ).toBeTruthy();
    }
  );

  it("does not celebrate non-milestone scores", () => {
    renderQuizCard(6, 0);

    expect(
      screen.queryByText(/in a row!/i)
    ).toBeNull();
  });

  it("does not celebrate before answering", () => {
    renderQuizCard(5, null);

    expect(
      screen.queryByText(/in a row!/i)
    ).toBeNull();
  });

  it("does not celebrate an incorrect answer", () => {
    renderQuizCard(5, 1);

    expect(
      screen.queryByText(/in a row!/i)
    ).toBeNull();

    expect(screen.getByText("Incorrect!")).toBeTruthy();
  });
});
