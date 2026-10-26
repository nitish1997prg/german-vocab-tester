
import { z } from "zod";

export const VocabularyQuestionSchema = z.object({
  id: z.string().trim().min(1),

  level: z.enum(["A1", "A2", "B1", "B2"]),

  word: z.string().trim().min(1),

  options: z.tuple([
    z.string().trim().min(1),
    z.string().trim().min(1),
    z.string().trim().min(1),
    z.string().trim().min(1),
  ]),

  correctOptionIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
});

export const QuizBatchSchema = z.object({
  questions: z.array(VocabularyQuestionSchema)
    .min(1)
    .max(5),
});
