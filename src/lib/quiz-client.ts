
import { z } from "zod";

import type { GermanLevel } from "@/types/quiz";
import type { GenerateQuizResponse } from "@/types/quiz-api";
import { VocabularyQuestionSchema } from "@/lib/quiz-schema";

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
  signal: AbortSignal
): Promise<GenerateQuizResponse> {
  const response = await fetch("/api/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      level,
      excludedWords,
    }),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Quiz API returned ${response.status}`);
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
