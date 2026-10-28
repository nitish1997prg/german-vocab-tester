
import type {
  VocabularyQuestion,
  OptionIndex,
} from "@/types/quiz";

export function shuffleQuestionOptions(
  question: VocabularyQuestion,
  random: () => number = Math.random
): VocabularyQuestion {
  const indices: OptionIndex[] = [0, 1, 2, 3];

  // Fisher–Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [indices[i], indices[j]] = [
      indices[j],
      indices[i],
    ];
  }

  // Rearrange the options
  const shuffledOptions: VocabularyQuestion["options"] = [
    question.options[indices[0]],
    question.options[indices[1]],
    question.options[indices[2]],
    question.options[indices[3]],
  ];

  // Find the new position of the correct answer
  const correctOptionIndex = indices.indexOf(
    question.correctOptionIndex
  ) as OptionIndex;

  return {
    ...question,
    options: shuffledOptions,
    correctOptionIndex,
  };
}
