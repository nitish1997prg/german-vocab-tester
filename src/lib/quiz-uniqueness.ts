
import type {
  GermanLevel,
  VocabularyQuestion,
} from "@/types/quiz";

export function normalizeGermanWord(word: string): string {
  return word
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/\s+/g, " ")
    .replace(/^(der|die|das)\s+/, "");
}



export function filterUniqueQuestions(
  questions: VocabularyQuestion[],
  excludedWords: string[],
  requestedLevel: GermanLevel
): VocabularyQuestion[] {
  const seenWords = new Set(
    excludedWords.map(normalizeGermanWord)
  );

  return questions.filter((question) => {
    // Reject questions from another CEFR level
    if (question.level !== requestedLevel) {
      return false;
    }

    const normalizedWord = normalizeGermanWord(
      question.word
    );

    // Reject previously encountered words
    if (seenWords.has(normalizedWord)) {
      return false;
    }

    // Mark this word as seen
    seenWords.add(normalizedWord);

    return true;
  });
}
