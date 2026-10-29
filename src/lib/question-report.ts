
import type { VocabularyQuestion } from "@/types/quiz";

export function buildQuestionReportMailto(
  question: VocabularyQuestion,
  selectedOptionIndex: number,
  feedbackEmail: string | undefined
): string | null {
  if (!feedbackEmail?.trim()) {
    return null;
  }

  const selectedAnswer =
    question.options[selectedOptionIndex];

  const correctAnswer =
    question.options[question.correctOptionIndex];

  const subject =
    "German Vocabulary Tester - Question Report";

  const body = [
    "Hello,",
    "",
    "I'd like to report a problem with this question.",
    "",
    "What is wrong with the question?",
    "(Please describe the issue below)",
    "",
    "",
    "--- Question Details ---",
    `Question ID: ${question.id}`,
    `Level: ${question.level}`,
    `German word: ${question.word}`,
    "",
    "Answer options:",
    ...question.options.map(
      (option, index) =>
        `${index + 1}. ${option}`
    ),
    "",
    `My answer: ${selectedAnswer}`,
    `Marked correct: ${correctAnswer}`,
    `Explanation: ${question.explanation ?? "Not provided"}`,
    "",
    "------------------------",
  ].join("\n");

  return (
    `mailto:${feedbackEmail.trim()}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}
