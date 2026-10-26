
"use client";

import { useState } from "react";

//Types
import type { GermanLevel, VocabularyQuestion } from "@/types/quiz";
import type { GenerateQuizResponse } from "@/types/quiz-api";

//Components
import LevelSelector from "@/components/LevelSelector";
import QuizCard from "@/components/QuizCard";
import ResultScreen from "@/components/ResultScreen";

type GameStatus =
  | "playing"
  | "gameOver"
  | "noMoreWords";

export default function Home() {
  const [selectedLevel, setSelectedLevel] =
    useState<GermanLevel | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
  
  const [selectedOptionIndex, setSelectedOptionIndex] =
    useState<number | null>(null);
  
  const [score, setScore] = useState(0);

  const [gameStatus, setGameStatus] =
    useState<GameStatus>("playing");

  
  const [questions, setQuestions] =
    useState<VocabularyQuestion[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  //Get current question from filtered questions
  const currentQuestion = questions[currentQuestionIndex];

  
  
  async function startGame(level: GermanLevel) {
    // Reset the previous game
    setSelectedLevel(level);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setGameStatus("playing");

    setQuestions([]);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          excludedWords: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vocabulary questions");
      }

      const data = (await response.json()) as GenerateQuizResponse;

      if (data.status === "ready") {
        if (data.questions.length === 0) {
          throw new Error("No questions were returned");
        }

        setQuestions(data.questions);
      } else if (data.status === "noMoreWords") {
        setGameStatus("noMoreWords");
      } else {
        throw new Error("Unexpected API response");
      }
    } catch (err) {
      console.error("Failed to start game:", err);

      setError(
        "Unable to generate questions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  
  function handleAnswerSelection(optionIndex: number) {
    if (
      selectedOptionIndex !== null ||
      !currentQuestion ||
      gameStatus !== "playing"
    ) {
      return;
    }

    setSelectedOptionIndex(optionIndex);

    if (optionIndex === currentQuestion.correctOptionIndex) {
      setScore((previousScore) => previousScore + 1);
    } else {
      setGameStatus("gameOver");
    }
  }

  
  function handleNextQuestion() {
    if (
      gameStatus !== "playing" ||
      !currentQuestion ||
      selectedOptionIndex !== currentQuestion.correctOptionIndex
    ) {
      return;
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      setGameStatus("noMoreWords");
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setSelectedOptionIndex(null);
  }

  function changeLevel() {
    setSelectedLevel(null);
  }


  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">
        German Vocabulary Tester
      </h1>

      {selectedLevel === null && (
        <LevelSelector onSelectLevel={startGame} />
      )}

      
      {isLoading && (
        <p role="status" className="text-lg">
          Generating your German vocabulary questions...
        </p>
      )}

      {error && selectedLevel && (
        <section
          role="alert"
          className="flex flex-col items-center gap-4"
        >
          <p className="text-red-600">{error}</p>

          <button
            onClick={() => void startGame(selectedLevel)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            Try Again
          </button>

          <button
            onClick={changeLevel}
            className="rounded-lg border px-6 py-3"
          >
            Change Level
          </button>
        </section>
      )}

      

      {currentQuestion && gameStatus === "playing" && !isLoading && !error && (
        <QuizCard
          question={currentQuestion}
          score={score}
          selectedOptionIndex={selectedOptionIndex}
          onSelectOption={handleAnswerSelection}
          onNextQuestion={handleNextQuestion}
        />
      )}

      
      {selectedLevel !== null &&
        (gameStatus === "gameOver" ||
          gameStatus === "noMoreWords") && (
          <ResultScreen
            status={gameStatus}
            score={score}
            level={selectedLevel}
            correctAnswer={
              currentQuestion
                ? currentQuestion.options[
                    currentQuestion.correctOptionIndex
                  ]
                : undefined
            }
            onPlayAgain={() => startGame(selectedLevel)}
            onChangeLevel={changeLevel}
          />
        )}





    </main>
  );
}
