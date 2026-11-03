
import { z } from "zod";

export const ReportReasonSchema = z.enum([
  "offensive",
  "incorrect",
  "level",
  "other",
]);

export type ReportReason = z.infer<
  typeof ReportReasonSchema
>;

export const QuestionReportSchema = z.object({
  level: z.enum(["A1", "A2", "B1", "B2"]),

  reason: ReportReasonSchema,

  question: z.object({
    id: z.string().min(1).max(100),
    word: z.string().trim().min(1).max(150),

    options: z.tuple([
      z.string().min(1).max(200),
      z.string().min(1).max(200),
      z.string().min(1).max(200),
      z.string().min(1).max(200),
    ]),

    correctOptionIndex: z.number()
      .int()
      .min(0)
      .max(3),

    explanation: z.string()
      .max(500)
      .optional(),
  }).strict(),
}).strict();
