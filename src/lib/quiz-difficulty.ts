
import type { VocabularyQuestion } from "@/types/quiz";
import { shuffleQuestions } from "@/lib/quiz-shuffle";

export type QuestionDifficulty =
  | "warmup"
  | "standard"
  | "hard"
  | "challenge";

export const MAX_QUESTIONS_PER_GAME = 20;

export function getQuestionDifficulty(
  questionNumber: number
): QuestionDifficulty {
  if (
    !Number.isInteger(questionNumber) ||
    questionNumber < 1 ||
    questionNumber > MAX_QUESTIONS_PER_GAME
  ) {
    throw new RangeError(
      "Question number must be between 1 and 20"
    );
  }

  if (questionNumber <= 5) return "warmup";

  if (questionNumber <= 10) return "standard";

  if (questionNumber <= 15) return "hard";

  return "challenge";
}


export function shuffleQuestionsWithinDifficulty(
  questions: VocabularyQuestion[],
  startQuestionNumber: number,
  random: () => number = Math.random
): VocabularyQuestion[] {
  const result: VocabularyQuestion[] = [];

  let start = 0;

  while (start < questions.length) {
    const difficulty = getQuestionDifficulty(
      startQuestionNumber + start
    );

    let end = start + 1;

    // Find the end of the current difficulty group
    while (
      end < questions.length &&
      getQuestionDifficulty(
        startQuestionNumber + end
      ) === difficulty
    ) {
      end++;
    }

    const group = questions.slice(start, end);

    result.push(...shuffleQuestions(group, random));

    start = end;
  }

  return result;
}
