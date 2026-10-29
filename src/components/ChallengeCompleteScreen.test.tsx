
// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import ChallengeCompleteScreen from "./ChallengeCompleteScreen";

afterEach(() => {
  cleanup();
});

describe("ChallengeCompleteScreen", () => {
  it("does not suggest an unavailable level after B2", () => {
    render(
      <ChallengeCompleteScreen
        level="B2"
        score={20}
        totalQuestions={20}
        onPlayAgain={vi.fn()}
        onChangeLevel={vi.fn()}
        onTryNextLevel={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /Challenge Complete!/i,
      })
    ).toBeTruthy();

    expect(
      screen.queryByRole("button", {
        name: /Try C1 Challenge/i,
      })
    ).toBeNull();

    expect(
      screen.getByRole("button", {
        name: /Play Again/i,
      })
    ).toBeTruthy();
  });
});
