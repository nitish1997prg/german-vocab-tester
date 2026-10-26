
import type { GermanLevel } from "@/types/quiz";

type ResultStatus = "gameOver" | "noMoreWords";

interface ResultScreenProps {
  status: ResultStatus;
  score: number;
  level: GermanLevel;
  correctAnswer?: string;
  onPlayAgain: () => void;
  onChangeLevel: () => void;
}


export default function ResultScreen({
  status,
  score,
  level,
  correctAnswer,
  onPlayAgain,
  onChangeLevel,
}: ResultScreenProps) {
  const isGameOver = status === "gameOver";

  return (
    <section className="mt-8 flex flex-col items-center gap-4 text-center">
      <h2
        className={`text-3xl font-bold ${
          isGameOver ? "text-red-600" : "text-green-600"
        }`}
      >
        {isGameOver
          ? "Game Over!"
          : "No More Words Available!"}
      </h2>

      <p>Level: {level}</p>

      <div>
        <p className="text-gray-500">Final Score</p>
        <p className="text-4xl font-bold">{score}</p>
      </div>

      {isGameOver && correctAnswer && (
        <p>
          Correct answer: {correctAnswer}
        </p>
      )}

      {!isGameOver && (
        <p>
          You&apos;ve completed the available questions.
        </p>
      )}

      <div className="mt-4 flex gap-4">
        <button
          onClick={onPlayAgain}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Play Again
        </button>

        <button
          onClick={onChangeLevel}
          className="rounded-lg border px-6 py-3"
        >
          Change Level
        </button>
      </div>
    </section>
  );
}
