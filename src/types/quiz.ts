
export type GermanLevel = "A1" | "A2" | "B1" | "B2";

export type OptionIndex = 0 | 1 | 2 | 3;

export interface VocabularyQuestion {
  id: string;
  level: GermanLevel;
  word: string;
  options: [string, string, string, string];
  correctOptionIndex: OptionIndex;
}
