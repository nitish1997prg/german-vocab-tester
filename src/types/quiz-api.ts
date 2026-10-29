
import type {
  GermanLevel,
  VocabularyQuestion,
} from "@/types/quiz";

export interface GenerateQuizRequest {
  level: GermanLevel;
  excludedWords: string[];
  startQuestionNumber?: number;
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
