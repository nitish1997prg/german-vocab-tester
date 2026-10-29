
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

  
  it("focuses Next Question after a correct answer", () => {
    const { rerender } = render(
      <QuizCard
        question={question}
        score={0}
        selectedOptionIndex={null}
        onSelectOption={vi.fn()}
        onNextQuestion={vi.fn()}
      />
    );

    rerender(
      <QuizCard
        question={question}
        score={1}
        selectedOptionIndex={0}
        onSelectOption={vi.fn()}
        onNextQuestion={vi.fn()}
      />
    );

    const nextButton = screen.getByRole("button", {
      name: /Next Question/i,
    });

    expect(document.activeElement).toBe(nextButton);
  });

  
  it("announces correct answer feedback in a live region", () => {
    renderQuizCard(1, 0);

    const status = screen.getByRole("status");

    expect(
      status.getAttribute("aria-live")
    ).toBe("polite");

    expect(
      status.getAttribute("aria-atomic")
    ).toBe("true");

    expect(status.textContent).toContain(
      "Correct! +1 point"
    );

    // Interactive controls should not be inside
    // the live announcement region.
    expect(
      status.querySelector("button")
    ).toBeNull();

    expect(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    ).toBeTruthy();
  });

  it("includes streak achievements in the live region", () => {
    renderQuizCard(10, 0);

    const status = screen.getByRole("status");

    expect(status.textContent).toContain(
      "Correct! +1 point"
    );

    expect(status.textContent).toContain(
      "10 in a row!"
    );

    expect(status.textContent).toContain(
      "Fantastisch! Halfway there!"
    );
  });


  it("supports long German compound words", () => {
    const longQuestion: VocabularyQuestion = {
      ...question,
      id: "long-word-test",
      word: "Kraftfahrzeughaftpflichtversicherung",
    };

    render(
      <QuizCard
        question={longQuestion}
        score={0}
        selectedOptionIndex={null}
        onSelectOption={vi.fn()}
        onNextQuestion={vi.fn()}
      />
    );

    const heading = screen.getByRole("heading", {
      name: "Kraftfahrzeughaftpflichtversicherung",
    });

    expect(heading).toBeTruthy();

    expect(heading.className).toContain(
      "[overflow-wrap:anywhere]"
    );
  });



});
