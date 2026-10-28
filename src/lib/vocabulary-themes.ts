
import type { GermanLevel } from "@/types/quiz";

export const VOCABULARY_THEMES: Record<
  GermanLevel,
  readonly string[]
> = {
  A1: [
    "food and drinks",
    "family and friends",
    "home and everyday objects",
    "daily routines",
    "shopping and clothing",
    "weather and seasons",
    "basic travel and transport",
  ],
  A2: [
    "work and daily responsibilities",
    "travel and accommodation",
    "health and appointments",
    "hobbies and free time",
    "relationships and communication",
    "shopping and services",
    "education and learning",
  ],
  B1: [
    "employment and workplace situations",
    "social relationships",
    "travel and culture",
    "education and personal development",
    "opinions and emotions",
    "public services",
    "health and wellbeing",
  ],
  B2: [
    "professional communication",
    "society and public affairs",
    "media and technology",
    "education and academic life",
    "environment and sustainability",
    "culture and interpersonal relationships",
    "abstract ideas and opinions",
  ],
};

export function selectVocabularyThemes(
  level: GermanLevel,
  random: () => number = Math.random
): string[] {
  const themes = [...VOCABULARY_THEMES[level]];

  // Fisher–Yates shuffle
  for (let i = themes.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [themes[i], themes[j]] = [themes[j], themes[i]];
  }

  return themes.slice(0, 2);
}
