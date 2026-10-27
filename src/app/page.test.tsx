
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
  act,
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


function createQuestions(
  start: number,
  count: number
): VocabularyQuestion[] {
  return Array.from({ length: count }, (_, index) => {
    const number = start + index;

    return {
      id: `q-${number}`,
      level: "A1",
      word: `das Testwort ${number}`,
      options: [
        `Meaning ${number}`,
        "Mountain",
        "River",
        "Sky",
      ],
      correctOptionIndex: 0,
    };
  });
}

const firstBatch = createQuestions(1, 10);
const secondBatch = createQuestions(11, 10);




function answerCorrectlyThrough(lastQuestion: number) {
  for (let number = 1; number <= lastQuestion; number++) {
    if (number > 1) {
      fireEvent.click(
        screen.getByRole("button", {
          name: /Next Question/i,
        })
      );
    }

    expect(
      screen.getByText(`das Testwort ${number}`)
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`Meaning ${number}`, "i"),
      })
    );
  }
}



function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}



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



describe("Background Prefetching", () => {
  it("prefetches after question 5 without blocking gameplay", async () => {
    mockFetchQuizBatch.mockResolvedValueOnce({
      status: "ready",
      questions: firstBatch,
    });

    // Keep the background request pending
    mockFetchQuizBatch.mockImplementationOnce(
      () => new Promise(() => {})
    );

    startA1Game();

    await screen.findByText("das Testwort 1");

    // Answer questions 1–4
    answerCorrectlyThrough(4);

    // No background request yet
    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(1);

    // Advance and answer question 5
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    fireEvent.click(
    screen.getByRole("button", {
      name: /Meaning 5\b/i,
    })
  );

    // Prefetch should have started
    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(2);

    // Continue playing while fetch is unresolved
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    expect(
      screen.getByText("das Testwort 6")
    ).toBeTruthy();
  });

  
  it("waits for the existing request instead of fetching twice", async () => {
    const deferred = createDeferred<{
      status: "ready";
      questions: VocabularyQuestion[];
    }>();

    mockFetchQuizBatch
      .mockResolvedValueOnce({
        status: "ready",
        questions: firstBatch,
      })
      .mockImplementationOnce(() => deferred.promise);

    startA1Game();

    await screen.findByText("das Testwort 1");

    // Player answers all 10 questions quickly
    answerCorrectlyThrough(10);

    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(2);

    // Player requests question 11
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    // No third request should be created
    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(2);

    // Finish the existing background request
    await act(async () => {
      deferred.resolve({
        status: "ready",
        questions: secondBatch,
      });

      await deferred.promise;
    });

    expect(
      await screen.findByText("das Testwort 11")
    ).toBeTruthy();

    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(2);
  });

  
  
  it("recovers from a failed background prefetch", async () => {
    const deferred = createDeferred<{
      status: "ready";
      questions: VocabularyQuestion[];
    }>();

    mockFetchQuizBatch
      .mockResolvedValueOnce({
        status: "ready",
        questions: firstBatch,
      })
      .mockImplementationOnce(() => deferred.promise)
      .mockResolvedValueOnce({
        status: "ready",
        questions: secondBatch,
      });

    startA1Game();

    await screen.findByText("das Testwort 1");

    // Answer questions 1–5.
    // Question 5 triggers background prefetching.
    answerCorrectlyThrough(5);

    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(2);

    // Explicitly fail the background request.
    // Wait for React to process the failure.
    await act(async () => {
      deferred.reject(
        new Error("Claude temporarily unavailable")
      );

      await deferred.promise.catch(() => {});
    });

    // The game should still display question 5.
    expect(
      screen.getByText("das Testwort 5")
    ).toBeTruthy();

    // Continue answering questions 6–10.
    for (let number = 6; number <= 10; number++) {
      fireEvent.click(
        screen.getByRole("button", {
          name: /Next Question/i,
        })
      );

      expect(
        screen.getByText(`das Testwort ${number}`)
      ).toBeTruthy();

      fireEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`Meaning ${number}\\b`, "i"),
        })
      );
    }

    // Request question 11.
    // Since the earlier prefetch already failed,
    // the application should start a new request.
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    expect(
      await screen.findByText("das Testwort 11")
    ).toBeTruthy();

    // Initial request + failed prefetch + recovery request.
    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(3);
  });


  
  it("finishes buffered questions before showing exhaustion", async () => {
    mockFetchQuizBatch
      .mockResolvedValueOnce({
        status: "ready",
        questions: firstBatch,
      })
      .mockResolvedValueOnce({
        status: "noMoreWords",
        questions: [],
      });

    startA1Game();

    await screen.findByText("das Testwort 1");

    answerCorrectlyThrough(5);

    // Allow the background response to finish
    await act(async () => {
      await Promise.resolve();
    });

    // Player can continue to question 6
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    expect(
      screen.getByText("das Testwort 6")
    ).toBeTruthy();

    
    // Continue through question 10
    for (let number = 6; number <= 10; number++) {
      if (number > 6) {
        fireEvent.click(
          screen.getByRole("button", {
            name: /Next Question/i,
          })
        );
      }

      // Verify the expected question is displayed
      expect(
        screen.getByText(`das Testwort ${number}`)
      ).toBeTruthy();

      // Match the answer even if it includes an option label
      fireEvent.click(
        screen.getByRole("button", {
          name: new RegExp(`Meaning ${number}\\b`, "i"),
        })
      );
    }


    // Now there are no buffered questions left
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: /No More Words Available/i,
      })
    ).toBeTruthy();

    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(2);
  });

  
  it("cancels prefetch when the player answers incorrectly", async () => {
    const deferred = createDeferred<{
      status: "ready";
      questions: VocabularyQuestion[];
    }>();

    mockFetchQuizBatch
      .mockResolvedValueOnce({
        status: "ready",
        questions: firstBatch,
      })
      .mockImplementationOnce(() => deferred.promise);

    startA1Game();

    await screen.findByText("das Testwort 1");

    answerCorrectlyThrough(5);

    expect(mockFetchQuizBatch).toHaveBeenCalledTimes(2);

    // Advance to question 6
    fireEvent.click(
      screen.getByRole("button", {
        name: /Next Question/i,
      })
    );

    // Wrong answer
    fireEvent.click(
    screen.getByRole("button", {
      name: /Mountain/i,
    })
  );

    expect(
      screen.getByRole("heading", {
        name: /Game Over/i,
      })
    ).toBeTruthy();

    const signal = mockFetchQuizBatch.mock.calls[1][2];

    expect(signal.aborted).toBe(true);

    // Even a late response must not restart gameplay
    await act(async () => {
      deferred.resolve({
        status: "ready",
        questions: secondBatch,
      });

      await deferred.promise;
    });

    expect(
      screen.getByRole("heading", {
        name: /Game Over/i,
      })
    ).toBeTruthy();
  });




});
