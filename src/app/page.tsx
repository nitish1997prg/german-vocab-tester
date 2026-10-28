
"use client";

import { useEffect , useRef , useState } from "react";

//Types
import type { GermanLevel, VocabularyQuestion } from "@/types/quiz";

//Components
import LevelSelector from "@/components/LevelSelector";
import QuizCard from "@/components/QuizCard";
import ResultScreen from "@/components/ResultScreen";
import ChallengeCompleteScreen from "@/components/ChallengeCompleteScreen";

//Utility functions
import { fetchQuizBatch } from "@/lib/quiz-client";
import { rememberWord, getRecentWords } from "@/lib/vocabulary-history";
import { normalizeGermanWord } from "@/lib/quiz-uniqueness";




type GameStatus =
  | "playing"
  | "gameOver"
  | "noMoreWords" | "completed";

const MAX_QUESTIONS_PER_GAME = 20;

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
  
  const [isPrefetching, setIsPrefetching] = useState(false);

  const [noMoreWordsAvailable, setNoMoreWordsAvailable] =
    useState(false);

  
  const activeRequestRef =
  useRef<AbortController | null>(null);

  const waitingForNextRef = useRef(false);

  const prefetchAttemptedAtLengthRef =
  useRef<number | null>(null);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    };
  }, []);


  //Get current question from filtered questions
  const currentQuestion = questions[currentQuestionIndex];

  
  useEffect(() => {
    if (
      selectedLevel === null ||
      !currentQuestion ||
      gameStatus !== "playing" ||
      isLoading ||
      error
    ) {
      return;
    }

    rememberWord(selectedLevel, currentQuestion.word);
  }, [
    selectedLevel,
    currentQuestion,
    gameStatus,
    isLoading,
    error,
  ]);



  
  
  async function loadBatch(
    level: GermanLevel,
    excludedWords: string[],
    mode: "replace" | "append",
    background = false
  ) {
    // Cancel an older request, if one exists
    activeRequestRef.current?.abort();

    const controller = new AbortController();
    activeRequestRef.current = controller;

    if (background) {
      setIsPrefetching(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {

      
      const currentGameWords = new Set(
        excludedWords.map(normalizeGermanWord)
      );

      // Retrieve recent vocabulary for this CEFR level.
      // getRecentWords() also handles the 24-hour expiry.
      const historicalWords = getRecentWords(level).filter(
        (word) =>
          !currentGameWords.has(normalizeGermanWord(word))
      );

      // Prefer fresh vocabulary
      const combinedExcludedWords = [
        ...excludedWords,
        ...historicalWords,
      ];

      let data = await fetchQuizBatch(
        level,
        combinedExcludedWords,
        controller.signal
      );

      // Ignore responses from an abandoned game
      if (
        activeRequestRef.current !== controller ||
        controller.signal.aborted
      ) {
        return;
      }

      // If historical exclusions are too restrictive,
      // retry once using only current-game exclusions.
      if (
        data.status === "noMoreWords" &&
        historicalWords.length > 0
      ) {
        console.log(
          "No fresh vocabulary found. Retrying without history."
        );

        data = await fetchQuizBatch(
          level,
          excludedWords,
          controller.signal
        );

        // The player might have exited during the retry.
        if (
          activeRequestRef.current !== controller ||
          controller.signal.aborted
        ) {
          return;
        }
      }

      if (data.status === "noMoreWords") {
        setNoMoreWordsAvailable(true);

        // Only finish when no playable questions remain
        if (
          mode === "replace" ||
          waitingForNextRef.current
        ) {
          setGameStatus("noMoreWords");
        }

        return;
      }

      
      if (mode === "replace") {
        setQuestions(
          data.questions.slice(0, MAX_QUESTIONS_PER_GAME)
        );

        setCurrentQuestionIndex(0);
        setSelectedOptionIndex(null);
      } else {
        // Never store more than 20 questions
        setQuestions((previous) => {
          const availableSlots = Math.max(
            0,
            MAX_QUESTIONS_PER_GAME - previous.length
          );

          const newQuestions = data.questions.slice(
            0,
            availableSlots
          );

          return [...previous, ...newQuestions];
        });

        // Resume if the player reached the last
        // available question during prefetching
        if (waitingForNextRef.current) {
          setCurrentQuestionIndex(
            (previous) => previous + 1
          );

          setSelectedOptionIndex(null);
        }
      }


    } catch (err) {
      if (
        activeRequestRef.current !== controller ||
        controller.signal.aborted
      ) {
        return;
      }

      console.error("Question loading failed:", err);

      // Background failures should not interrupt gameplay.
      // Show the error if the learner actually needs more words.
      if (!background || waitingForNextRef.current) {
        setError(
          "Unable to load vocabulary questions. Please try again."
        );
      }

    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;

        setIsLoading(false);
        setIsPrefetching(false);

        waitingForNextRef.current = false;
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
    setIsPrefetching(false);
    setNoMoreWordsAvailable(false);

    waitingForNextRef.current = false;
    prefetchAttemptedAtLengthRef.current = null;

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

    const isCorrect =
      optionIndex === currentQuestion.correctOptionIndex;

    if (!isCorrect) {
      // Stop an unnecessary background request
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
      setIsPrefetching(false);

      setGameStatus("gameOver");
      return;
    }

    const nextScore = score + 1;

    setScore(nextScore);

    // The player answered all 20 questions correctly
    if (nextScore >= MAX_QUESTIONS_PER_GAME) {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
      setIsPrefetching(false);
      waitingForNextRef.current = false;

      setGameStatus("completed");
      return;
    }

    const remainingQuestions =
      questions.length - (currentQuestionIndex + 1);

    const shouldPrefetch =
      remainingQuestions <= 5 &&
      selectedLevel !== null &&
      !noMoreWordsAvailable && questions.length < MAX_QUESTIONS_PER_GAME &&
      !activeRequestRef.current &&
      prefetchAttemptedAtLengthRef.current !==
        questions.length;

    if (shouldPrefetch && selectedLevel) {
      prefetchAttemptedAtLengthRef.current =
        questions.length;

      const excludedWords = questions.map(
        (question) => question.word
      );

      void loadBatch(
        selectedLevel,
        excludedWords,
        "append",
        true
      );
    }
  }


  
  
  
  function handleNextQuestion() {
    if (
      gameStatus !== "playing" ||
      !currentQuestion ||
      !selectedLevel ||
      isLoading ||
      waitingForNextRef.current ||
      selectedOptionIndex !==
        currentQuestion.correctOptionIndex
    ) {
      return;
    }

    

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= MAX_QUESTIONS_PER_GAME) {
      setGameStatus("completed");
      return;
    }

    // There is already another question available
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOptionIndex(null);
      return;
    }

    // No buffered questions remain
    if (noMoreWordsAvailable) {
      setGameStatus("noMoreWords");
      return;
    }

    // The user wants the next question
    waitingForNextRef.current = true;
    setIsLoading(true);

    // A background request is already running.
    // Wait for it instead of starting another.
    if (activeRequestRef.current) {
      return;
    }

    // Background prefetch failed or wasn't started.
    // Fetch now without resetting the score.
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
    setIsPrefetching(false);
    setNoMoreWordsAvailable(false);

    waitingForNextRef.current = false;
    prefetchAttemptedAtLengthRef.current = null;
  }



  return (
    <main className="flex min-h-dvh items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
       <div className=" flex w-full min-w-0 max-w-md flex-col
        items-center gap-6 rounded-3xl
        border border-[var(--border)]
        bg-[var(--surface)]
        p-5 shadow-sm sm:p-8">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        German Vocabulary Tester
      </h1>

      
      {selectedLevel !== null &&
        gameStatus === "playing" &&
        !error && !isLoading &&  (
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={changeLevel}
              className="
                rounded-lg border border-[var(--border)]
                px-3 py-2 text-sm font-medium
                text-[var(--muted)]
                transition-colors
                hover:bg-gray-100
                hover:text-gray-900
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-green-700
              "
            >
              Exit Quiz
            </button>
          </div>
        )}


      {selectedLevel === null && (
        <LevelSelector onSelectLevel={startGame} />
      )}

      
      {isLoading && (
      <p role="status" className="text-center text-sm text-[var(--muted)]">
        {questions.length === 0
          ? "Generating your vocabulary questions..."
          : "Preparing more vocabulary questions..."}
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


      
    {selectedLevel !== null &&
      currentQuestion &&
      gameStatus === "playing" &&
      !error && (
        <section
          className="w-full space-y-3"
          aria-label="Quiz progress"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)]">
                {selectedLevel} Vocabulary Challenge
              </p>

              <p className="text-sm font-semibold">
                Question {Math.min(
                  currentQuestionIndex + 1,
                  MAX_QUESTIONS_PER_GAME
                )} of {MAX_QUESTIONS_PER_GAME}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-[var(--muted)]">
                Score
              </p>
              <p className="text-lg font-bold">
                {score}
              </p>
            </div>
          </div>

          <div
            role="progressbar"
            aria-label="Correct answers"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={MAX_QUESTIONS_PER_GAME}
            className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200"
          >
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-300"
              style={{
                width: `${
                  (score / MAX_QUESTIONS_PER_GAME) * 100
                }%`,
              }}
            />
          </div>

          <p className="text-center text-xs text-[var(--muted)]">
            {score} correct ·{" "}
            {MAX_QUESTIONS_PER_GAME - score} remaining
          </p>
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
      
      
      
      {selectedLevel !== null &&
        gameStatus === "completed" && (
          <ChallengeCompleteScreen
            level={selectedLevel}
            score={score}
            totalQuestions={MAX_QUESTIONS_PER_GAME}
            onPlayAgain={() => startGame(selectedLevel)}
            onChangeLevel={changeLevel}
          />
        )}




      </div>

    </main>
  );
}
