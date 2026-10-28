
import type { GermanLevel } from "@/types/quiz";
import { normalizeGermanWord } from "@/lib/quiz-uniqueness";

const MAX_HISTORY = 60;

const HISTORY_TTL_MS = 24 * 60 * 60 * 1000;

function expiryKey(level: GermanLevel): string {
  return `vocab-history-${level}-expiresAt`;
}

function storageKey(level: GermanLevel): string {
  return `vocab-history-${level}`;
}


function clearExpiredHistory(level: GermanLevel): void {
  const key = storageKey(level);
  const expiry = expiryKey(level);

  const storedWords = localStorage.getItem(key);
  const storedExpiry = localStorage.getItem(expiry);

  if (!storedWords) {
    localStorage.removeItem(expiry);
    return;
  }

  // Existing history from before this feature:
  // give it a fresh 24-hour expiry.
  if (!storedExpiry) {
    localStorage.setItem(
      expiry,
      String(Date.now() + HISTORY_TTL_MS)
    );
    return;
  }

  const expiresAt = Number(storedExpiry);

  if (
    !Number.isFinite(expiresAt) ||
    Date.now() >= expiresAt
  ) {
    localStorage.removeItem(key);
    localStorage.removeItem(expiry);
  }
}


export function getRecentWords(
  level: GermanLevel
): string[] {
  try {
    // Clear the history if 24 hours have passed
    clearExpiredHistory(level);
    const stored = localStorage.getItem(
      storageKey(level)
    );

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    // Validate, deduplicate and retain recent words
    const unique = new Map<string, string>();

    for (const value of parsed) {
      if (typeof value !== "string") continue;

      const normalized = normalizeGermanWord(value);

      if (!normalized) continue;

      unique.delete(normalized);
      unique.set(normalized, value);
    }

    return [...unique.values()].slice(-MAX_HISTORY);
  } catch {
    // Browser storage may be disabled or corrupted
    return [];
  }
}

export function rememberWord(
  level: GermanLevel,
  word: string
): void {
  try {
    const normalized = normalizeGermanWord(word);

    if (!normalized) return;

    const previous = getRecentWords(level);

    const updated = [
      ...previous.filter(
        (existing) =>
          normalizeGermanWord(existing) !== normalized
      ),
      word,
    ].slice(-MAX_HISTORY);

    localStorage.setItem(
      storageKey(level),
      JSON.stringify(updated)
    );

    if (!localStorage.getItem(expiryKey(level))) {
        localStorage.setItem(
            expiryKey(level),
            String(Date.now() + HISTORY_TTL_MS)
        );
        }
  } catch {
    // Quiz gameplay should still work if storage fails
  }
}
