
import { z } from "zod";

import type { GermanLevel } from "@/types/quiz";
import type { GenerateQuizResponse } from "@/types/quiz-api";
import { VocabularyQuestionSchema } from "@/lib/quiz-schema";


export class QuizApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "QuizApiError";
  }
}


const ResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ready"),
    questions: z.array(VocabularyQuestionSchema)
      .min(1)
      .max(10),
  }),
  z.object({
    status: z.literal("noMoreWords"),
    questions: z.array(VocabularyQuestionSchema).length(0),
  }),
]);

export async function fetchQuizBatch(
  level: GermanLevel,
  excludedWords: string[],
  signal?: AbortSignal | undefined,
  startQuestionNumber: number = 1
): Promise<GenerateQuizResponse> {
  const response = await fetch("/api/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      level,
      excludedWords,
      startQuestionNumber,
    }),
    signal,
    cache: "no-store",
  });

  
  if (!response.ok) {
    if (response.status === 429) {
      throw new QuizApiError(
        429,
        "Too many requests. Please wait a minute before trying again."
      );
    }

    if (
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504
    ) {
      throw new QuizApiError(
        response.status,
        "Question generation is temporarily unavailable. Please try again shortly."
      );
    }

    if (response.status === 413) {
      throw new QuizApiError(
        413,
        "The question request is too large."
      );
    }

    throw new QuizApiError(
      response.status,
      "Unable to generate questions. Please try again."
    );
  }


  const data: unknown = await response.json();

  const result = ResponseSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid quiz API response");
  }

  if (result.data.status === "noMoreWords") {
    return {
      status: "noMoreWords",
      questions: [],
    };
  }

  return {
    status: "ready",
    questions: result.data.questions,
  };
}
