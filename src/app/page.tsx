
"use client";

import { useState } from "react";

import type { GermanLevel } from "@/types/quiz";
import { sampleQuestions } from "@/data/questions";

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
  
  //Filter questions based on level selected
  const filteredQuestions = sampleQuestions.filter(
    (question) => question.level === selectedLevel
  );

  //Get current question from filtered questions
  const currentQuestion =
    filteredQuestions[currentQuestionIndex];

  
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

      {selectedLevel === null && (
        <LevelSelector onSelectLevel={startGame} />
      )}
      

      {currentQuestion && gameStatus === "playing" && (
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
