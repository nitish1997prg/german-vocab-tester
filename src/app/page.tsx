
"use client";

import { useState } from "react";
import type { GermanLevel } from "@/types/quiz"
import { sampleQuestions } from "@/data/questions";

const levels: GermanLevel[] = ["A1", "A2", "B1", "B2"];

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
  
  //Filter questions based on level selected
  const filteredQuestions = sampleQuestions.filter(
    (question) => question.level === selectedLevel
  );

  //Get current question from filtered questions
  const currentQuestion =
    filteredQuestions[currentQuestionIndex];
  
  const isCorrect = currentQuestion && selectedOptionIndex === currentQuestion.correctOptionIndex;

  
  function startGame(level: GermanLevel) {
    setSelectedLevel(level);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setGameStatus("playing");
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

    if (nextIndex >= filteredQuestions.length) {
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

      <p>Select your German proficiency level</p>

      {selectedLevel === null && (
        <div className="flex gap-4">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => startGame(level)}
                className="rounded-lg border px-6 py-3 hover:bg-gray-100 hover:text-black"
              >
                {level}
              </button>
            ))}
      </div>
      )}
      

      {currentQuestion && gameStatus === "playing" && (
        <section className="mt-8 text-center">
          <p className="mb-4 font-semibold">
             Score: {score}
          </p>
          <h2 className="mb-4 text-2xl font-semibold">
            {currentQuestion.word}
          </h2>

          <p className="mb-4">
            What does this German word mean?
          </p>

          <div className="grid grid-cols-2 gap-4">
            
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelection(index)}
                disabled={selectedOptionIndex !== null}
                className={`rounded-lg border p-4 ${
                  selectedOptionIndex === index
                    ? isCorrect
                      ? "border-green-500 bg-green-100 text-green-900"
                      : "border-red-500 bg-red-100 text-red-900"
                    : ""
                }`}
              >
                {option}
              </button>
            ))}

          </div>

          {selectedOptionIndex !== null && (
            <p className="mt-4 font-semibold">
              {isCorrect ? "Correct!" : "Incorrect!"}
            </p>
          )}

          {selectedOptionIndex !== null && isCorrect && (
          <button
            onClick={handleNextQuestion}
            className="mt-4 rounded-lg bg-green-700 px-6 py-3 text-white"
          >
            Next Question
          </button>
        )}

        </section>
      )}

      
      {gameStatus === "gameOver" && (
        <section className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-red-600">
            Game Over!
          </h2>

          <p className="mt-4">
            Final Score: {score}
          </p>

          {currentQuestion && (
            <p className="mt-2">
              Correct answer: {
                currentQuestion.options[
                  currentQuestion.correctOptionIndex
                ]
              }
            </p>
          )}

          <div className="mt-6 flex justify-center gap-4">
          {selectedLevel && (
            <button
              onClick={() => startGame(selectedLevel)}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-white"
            >
              Play Again
            </button>
          )}

          <button
            onClick={changeLevel}
            className="mt-4 rounded-lg border px-6 py-3"
          >
            Change Level
          </button>
          </div>
        </section>
      )}

      {gameStatus === "noMoreWords" && (
        <section className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-green-600">
            No More Words Available!
          </h2>

          <p className="mt-4">
            Final Score: {score}
          </p>

          <p className="mt-2">
            You&apos;ve completed the available sample questions.
          </p>

          <div className="mt-6 flex justify-center gap-4">
          {selectedLevel && (
            <button
              onClick={() => startGame(selectedLevel)}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-white"
            >
              Play Again
            </button>
          )}

          <button
            onClick={changeLevel}
            className="mt-4 rounded-lg border px-6 py-3"
          >
            Change Level
          </button>
          </div>
        </section>
      )}




    </main>
  );
}
