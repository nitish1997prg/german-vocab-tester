
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fetchQuizBatch,
  QuizApiError,
} from "./quiz-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchQuizBatch error handling", () => {
  it("throws QuizApiError for HTTP 429", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Too Many Requests",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      fetchQuizBatch("A1", [], undefined, 1)
    ).rejects.toMatchObject({
      name: "QuizApiError",
      status: 429,
      message:
        "Too many requests. Please wait a minute before trying again.",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("throws a friendly error for HTTP 503", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Internal provider details",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      fetchQuizBatch("A1", [], undefined, 1)
    ).rejects.toMatchObject({
      name: "QuizApiError",
      status: 503,
      message:
        "Question generation is temporarily unavailable. Please try again shortly.",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
