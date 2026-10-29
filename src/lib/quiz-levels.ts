
import type { GermanLevel } from "@/types/quiz";

const NEXT_LEVEL: Record<GermanLevel, GermanLevel | null> = {
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: null,
};

export function getNextLevel(
  level: GermanLevel
): GermanLevel | null {
  return NEXT_LEVEL[level];
}
