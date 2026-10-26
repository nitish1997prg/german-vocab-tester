
import type {
  GermanLevel,
  VocabularyQuestion,
} from "@/types/quiz";

export interface GenerateQuizRequest {
  level: GermanLevel;
  excludedWords: string[];
}

export type GenerateQuizResponse =
  | {
      status: "ready";
      questions: VocabularyQuestion[];
    }
  | {
      status: "noMoreWords";
      questions: [];
    };
