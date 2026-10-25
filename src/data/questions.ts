
import type { VocabularyQuestion } from "@/types/quiz";

export const sampleQuestions: VocabularyQuestion[] = [
  {
    id: "a1-001",
    level: "A1",
    word: "der Apfel",
    options: ["Apple", "House", "Book", "Water"],
    correctOptionIndex: 0,
  },
  {
    id: "a1-002",
    level: "A1",
    word: "das Fenster",
    options: ["Chair", "Window", "Door", "Table"],
    correctOptionIndex: 1,
  },
  {
    id: "a2-001",
    level: "A2",
    word: "die Einladung",
    options: ["Journey", "Invitation", "Decision", "Receipt"],
    correctOptionIndex: 1,
  },
  {
    id: "b1-001",
    level: "B1",
    word: "die Voraussetzung",
    options: ["Requirement", "Solution", "Result", "Suggestion"],
    correctOptionIndex: 0,
  },
  {
    id: "b2-001",
    level: "B2",
    word: "nachvollziehbar",
    options: ["Temporary", "Unnecessary", "Comprehensible", "Independent"],
    correctOptionIndex: 2,
  },
];
