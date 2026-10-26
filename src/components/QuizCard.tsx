
import type { VocabularyQuestion } from "@/types/quiz";

interface QuizCardProps {
  question: VocabularyQuestion;
  score: number;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
}


export default function QuizCard({
  question,
  score,
  selectedOptionIndex,
  onSelectOption,
  onNextQuestion,
}: QuizCardProps) {
  const hasAnswered = selectedOptionIndex !== null;

  const isCorrect =
    hasAnswered &&
    selectedOptionIndex === question.correctOptionIndex;

  return (
    <section className="mt-8 text-center">
      <p className="mb-4 font-semibold">
        Score: {score}
      </p>

      <h2 className="mb-4 text-2xl font-semibold">
        {question.word}
      </h2>

      <p className="mb-4">
        What does this German word mean?
      </p>

      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectOption(index)}
            disabled={hasAnswered}
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

      {hasAnswered && (
        <p className="mt-4 font-semibold">
          {isCorrect ? "Correct!" : "Incorrect!"}
        </p>
      )}

      {isCorrect && (
        <button
          onClick={onNextQuestion}
          className="mt-4 rounded-lg bg-green-700 px-6 py-3 text-white"
        >
          Next Question
        </button>
      )}
    </section>
  );
}
