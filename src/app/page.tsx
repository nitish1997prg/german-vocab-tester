
"use client";

import { useEffect , useRef , useState } from "react";

//Types
import type { GermanLevel, VocabularyQuestion } from "@/types/quiz";

//Components
import LevelSelector from "@/components/LevelSelector";
import QuizCard from "@/components/QuizCard";
import ResultScreen from "@/components/ResultScreen";

//Utility functions
import { fetchQuizBatch } from "@/lib/quiz-client";

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

  
  const activeRequestRef =
  useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    };
  }, []);


  //Get current question from filtered questions
  const currentQuestion = questions[currentQuestionIndex];


  
  async function loadBatch(
    level: GermanLevel,
    excludedWords: string[],
    mode: "replace" | "append"
  ) {
    // Cancel any previous request
    activeRequestRef.current?.abort();

    const controller = new AbortController();
    activeRequestRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchQuizBatch(
        level,
        excludedWords,
        controller.signal
      );

      // Ignore an outdated response
      if (activeRequestRef.current !== controller) {
        return;
      }

      if (data.status === "noMoreWords") {
        setGameStatus("noMoreWords");
        return;
      }

      if (mode === "replace") {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(questions.length);

        setQuestions((previous) => [
          ...previous,
          ...data.questions,
        ]);
      }

      setSelectedOptionIndex(null);

    } catch (err) {
      if (
        activeRequestRef.current !== controller ||
        controller.signal.aborted
      ) {
        return;
      }

      console.error("Question loading failed:", err);

      setError(
        "Unable to load vocabulary questions. Please try again."
      );

    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
        setIsLoading(false);
      }
    }
  }




  
  
  async function startGame(level: GermanLevel) {
    // Reset the previous game
    setSelectedLevel(level);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setGameStatus("playing");
    setQuestions([]);

    void loadBatch(level,[],"replace");
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

  
  
  async function handleNextQuestion() {
    if (
      gameStatus !== "playing" ||
      !currentQuestion ||
      !selectedLevel ||
      isLoading ||
      selectedOptionIndex !== currentQuestion.correctOptionIndex
    ) {
      return;
    }

    const nextIndex = currentQuestionIndex + 1;

    // Case 1: Another question is already available
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOptionIndex(null);
      return;
    }

    const excludedWords = questions.map(
        (question) => question.word
      );

    void loadBatch(
      selectedLevel,
      excludedWords,
      "append"
    );

  }


  
  function changeLevel() {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setSelectedLevel(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setGameStatus("playing");
    setError(null);
    setIsLoading(false);
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

          <p>Current Score: {score}</p>

          <button
            onClick={() => {
              if (questions.length === 0) {
                void startGame(selectedLevel);
              } else {
                void handleNextQuestion();
              }
            }}
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


      

      {selectedLevel !== null && currentQuestion && gameStatus === "playing" && !isLoading && !error && (
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
