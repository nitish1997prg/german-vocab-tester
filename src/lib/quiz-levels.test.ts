
import { describe, expect, it } from "vitest";
import { getNextLevel } from "./quiz-levels";

describe("getNextLevel", () => {
  it.each([
    ["A1", "A2"],
    ["A2", "B1"],
    ["B1", "B2"],
  ] as const)(
    "progresses from %s to %s",
    (current, next) => {
      expect(getNextLevel(current)).toBe(next);
    }
  );

  it("does not suggest a level above B2", () => {
    expect(getNextLevel("B2")).toBeNull();
  });
});
