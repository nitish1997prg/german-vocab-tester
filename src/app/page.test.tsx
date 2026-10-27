
// @vitest-environment jsdom

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import Home from "./page";

const { mockFetchQuizBatch } = vi.hoisted(() => ({
  mockFetchQuizBatch: vi.fn(),
}));

vi.mock("@/lib/quiz-client", () => ({
  fetchQuizBatch: mockFetchQuizBatch,
}));

beforeEach(() => {
  mockFetchQuizBatch.mockReset();
});

afterEach(() => {
  cleanup();
});



import type { VocabularyQuestion } from "@/types/quiz";

const questionOne: VocabularyQuestion = {
  id: "q-001",
  level: "A1",
  word: "der Apfel",
  options: ["Apple", "House", "Water", "Book"],
  correctOptionIndex: 0,
};

const questionTwo: VocabularyQuestion = {
  id: "q-002",
  level: "A1",
  word: "das Haus",
  options: ["Apple", "House", "Water", "Book"],
  correctOptionIndex: 1,
};

function startA1Game() {
  render(<Home />);

  fireEvent.click(
    screen.getByRole("button", { name: /A1/i })
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /Start Challenge/i,
    })
  );
}


describe("German Vocabulary Gameplay", () => {
    
  it("increments score and advances after a correct answer", async () => {
    mockFetchQuizBatch.mockResolvedValue({
      status: "ready",
      questions: [questionOne, questionTwo],
    });

    startA1Game();

    // Wait for generated questions to load
    expect(
      await screen.findByText("der Apfel")
    ).toBeTruthy();

    // Select the correct answer
    fireEvent.click(
      screen.getByRole("button", { name: /Apple/i })
    );

    expect(
      screen.getByText("Correct! +1 point")
    ).toBeTruthy();

    expect(
      screen.getByText(/🏆\s*1/)
    ).toBeTruthy();

    // Move to next question
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    expect(
      screen.getByText("das Haus")
    ).toBeTruthy();

    // Score should still be 1
    expect(
      screen.getByText(/🏆\s*1/)
    ).toBeTruthy();
  });

  
    it("ends the game after an incorrect answer", async () => {
    mockFetchQuizBatch.mockResolvedValue({
        status: "ready",
        questions: [questionOne],
    });

    startA1Game();

    await screen.findByText("der Apfel");

    // Select an incorrect answer
    fireEvent.click(
        screen.getByRole("button", { name: /House/i })
    );

    expect(
        screen.getByRole("heading", {
        name: "Game Over!",
        })
    ).toBeTruthy();

    expect(
        screen.getByText("Final Score")
    ).toBeTruthy();

    expect(
        screen.getByText("Apple")
    ).toBeTruthy();
    });

    
    it("preserves score when retrying a failed batch", async () => {
    mockFetchQuizBatch
        .mockResolvedValueOnce({
        status: "ready",
        questions: [questionOne],
        })
        .mockRejectedValueOnce(
        new Error("AI service unavailable")
        )
        .mockResolvedValueOnce({
        status: "ready",
        questions: [questionTwo],
        });

    startA1Game();

    await screen.findByText("der Apfel");

    // Answer the first question correctly
    fireEvent.click(
        screen.getByRole("button", { name: /Apple/i })
    );

    // Request the next batch
    fireEvent.click(
        screen.getByRole("button", {
        name: /Next Question/i,
        })
    );

    // The mocked request fails
    const retryButton = await screen.findByRole(
        "button",
        { name: /Try Again/i }
    );

    expect(
        screen.getByText("Current Score: 1")
    ).toBeTruthy();

    // Retry the failed request
    fireEvent.click(retryButton);

    // The next batch loads
    expect(
        await screen.findByText("das Haus")
    ).toBeTruthy();

    // Previously used vocabulary was excluded
    expect(mockFetchQuizBatch).toHaveBeenLastCalledWith(
        "A1",
        ["der Apfel"],
        expect.any(AbortSignal)
    );

    // Score remains 1
    expect(
        screen.getByText(/🏆\s*1/)
    ).toBeTruthy();
    });

    
    it("shows the final score when no more words are available", async () => {
    mockFetchQuizBatch
        .mockResolvedValueOnce({
        status: "ready",
        questions: [questionOne],
        })
        .mockResolvedValueOnce({
        status: "noMoreWords",
        questions: [],
        });

    startA1Game();

    await screen.findByText("der Apfel");

    fireEvent.click(
        screen.getByRole("button", { name: /Apple/i })
    );

    fireEvent.click(
        screen.getByRole("button", {
        name: /Next Question/i,
        })
    );

    expect(
        await screen.findByRole("heading", {
        name: "No More Words Available!",
        })
    ).toBeTruthy();

    expect(
        screen.getByText("Final Score")
    ).toBeTruthy();

    expect(
        screen.getByText("1")
    ).toBeTruthy();
    });



});
