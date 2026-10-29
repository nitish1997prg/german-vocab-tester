
/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import ResultScreen from "./ResultScreen";

afterEach(cleanup);

describe("ResultScreen", () => {
  const mockOnPlayAgain = vi.fn();
  const mockOnChangeLevel = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("displays the final score after game over", () => {
    render(
      <ResultScreen
        status="gameOver"
        score={7}
        level="B1"
        onPlayAgain={mockOnPlayAgain}
        onChangeLevel={mockOnChangeLevel}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /Game Over!/i,
      })
    ).toBeTruthy();

    expect(screen.getByText("7")).toBeTruthy();

    expect(
      screen.getByText("B1 Vocabulary")
    ).toBeTruthy();
  });

  it("shows the incorrect and correct answers", () => {
    render(
      <ResultScreen
        status="gameOver"
        score={7}
        level="B1"
        correctAnswer={{
          word: "die Voraussetzung",
          selectedMeaning: "The experience",
          correctMeaning: "The prerequisite",
        }}
        onPlayAgain={mockOnPlayAgain}
        onChangeLevel={mockOnChangeLevel}
      />
    );

    expect(
      screen.getByText("die Voraussetzung")
    ).toBeTruthy();

    expect(
      screen.getByText("The experience")
    ).toBeTruthy();

    expect(
      screen.getByText("The prerequisite")
    ).toBeTruthy();
  });

  it("displays the AI-generated vocabulary explanation", () => {
    render(
      <ResultScreen
        status="gameOver"
        score={7}
        level="B1"
        correctAnswer={{
          word: "die Voraussetzung",
          selectedMeaning: "The experience",
          correctMeaning: "The prerequisite",
          explanation:
            "A Voraussetzung is a condition that must be met before something can happen.",
        }}
        onPlayAgain={mockOnPlayAgain}
        onChangeLevel={mockOnChangeLevel}
      />
    );

    expect(
      screen.getByText("Why this is correct")
    ).toBeTruthy();

    expect(
      screen.getByText(
        /A Voraussetzung is a condition/i
      )
    ).toBeTruthy();
  });

  it("works when no explanation is provided", () => {
    render(
      <ResultScreen
        status="gameOver"
        score={3}
        level="A1"
        correctAnswer={{
          word: "der Apfel",
          selectedMeaning: "House",
          correctMeaning: "Apple",
        }}
        onPlayAgain={mockOnPlayAgain}
        onChangeLevel={mockOnChangeLevel}
      />
    );

    expect(
      screen.getByText("Apple")
    ).toBeTruthy();

    expect(
      screen.queryByText("Why this is correct")
    ).toBeNull();
  });

  it("does not show answer review when noMoreWords", () => {
    render(
      <ResultScreen
        status="noMoreWords"
        score={10}
        level="A2"
        correctAnswer={{
          word: "der Apfel",
          selectedMeaning: "House",
          correctMeaning: "Apple",
          explanation: "Apfel means apple in German.",
        }}
        onPlayAgain={mockOnPlayAgain}
        onChangeLevel={mockOnChangeLevel}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /No More Words Available!/i,
      })
    ).toBeTruthy();

    expect(
      screen.queryByText("der Apfel")
    ).toBeNull();

    expect(
      screen.queryByText("Why this is correct")
    ).toBeNull();
  });

  it("calls onPlayAgain when Play Again is clicked", () => {
    render(
      <ResultScreen
        status="gameOver"
        score={5}
        level="A1"
        onPlayAgain={mockOnPlayAgain}
        onChangeLevel={mockOnChangeLevel}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Play Again/i,
      })
    );

    expect(mockOnPlayAgain).toHaveBeenCalledOnce();
  });

  it("calls onChangeLevel when Change Level is clicked", () => {
    render(
      <ResultScreen
        status="gameOver"
        score={5}
        level="A1"
        onPlayAgain={mockOnPlayAgain}
        onChangeLevel={mockOnChangeLevel}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Change Level/i,
      })
    );

    expect(mockOnChangeLevel).toHaveBeenCalledOnce();
  });
});
