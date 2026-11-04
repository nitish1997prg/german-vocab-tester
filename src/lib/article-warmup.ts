
export type GermanArticle = "der" | "die" | "das";

export type WarmupWord = {
  noun: string;
  article: GermanArticle;
  english: string;
};

export const WARMUP_WORDS: readonly WarmupWord[] = [
  {
    noun: "Kaffee",
    article: "der",
    english: "the coffee",
  },
  {
    noun: "Sonne",
    article: "die",
    english: "the sun",
  },
  {
    noun: "Buch",
    article: "das",
    english: "the book",
  },
  {
    noun: "Tisch",
    article: "der",
    english: "the table",
  },
  {
    noun: "Katze",
    article: "die",
    english: "the cat",
  },
  {
    noun: "Wasser",
    article: "das",
    english: "the water",
  },
  {
    noun: "Schlüssel",
    article: "der",
    english: "the key",
  },
  {
    noun: "Zeit",
    article: "die",
    english: "the time",
  },
  {
    noun: "Haus",
    article: "das",
    english: "the house",
  },
];

export function isCorrectArticle(
  word: WarmupWord,
  selected: GermanArticle
): boolean {
  return word.article === selected;
}

export function nextWarmupIndex(
  currentIndex: number
): number {
  return (currentIndex + 1) % WARMUP_WORDS.length;
}
