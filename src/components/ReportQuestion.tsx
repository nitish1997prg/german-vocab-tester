
"use client";

import { useState, type FormEvent } from "react";

import type {
  GermanLevel,
  VocabularyQuestion,
} from "@/types/quiz";

import type {
  ReportReason,
} from "@/lib/report-schema";

type Props = {
  level: GermanLevel;
  question: VocabularyQuestion;
};

export default function ReportQuestion({
  level,
  question,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [reason, setReason] =
    useState<ReportReason>("offensive");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  async function submitReport(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          reason,
          question: {
            id: question.id,
            word: question.word,
            options: question.options,
            correctOptionIndex:
              question.correctOptionIndex,
            explanation: question.explanation,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Report submission failed");
      }

      setStatus("success");
      setIsOpen(false);
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="text-sm text-green-700">
        Report received. Thank you for helping us
        improve the questions.
      </p>
    );
  }

  return (
    <section className="mt-4 text-sm">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((current) => !current);
          setStatus("idle");
        }}
        className="text-gray-600 underline underline-offset-4"
      >
        Report question
      </button>

      {isOpen && (
        <form
          onSubmit={submitReport}
          className="mt-3 space-y-3 rounded-xl border
                     border-gray-200 bg-white p-4"
        >
          <h3 className="font-semibold text-gray-900">
            Report this question
          </h3>

          <label
            htmlFor="report-reason"
            className="block text-gray-700"
          >
            Why are you reporting it?
          </label>

          <select
            id="report-reason"
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value as ReportReason
              )
            }
            className="w-full rounded-lg border
                       border-gray-300 p-3 text-gray-900"
          >
            <option value="offensive">
              Offensive or inappropriate content
            </option>

            <option value="incorrect">
              Incorrect translation or answer
            </option>

            <option value="level">
              Incorrect difficulty level
            </option>

            <option value="other">
              Other problem
            </option>
          </select>

          {status === "error" && (
            <p role="alert" className="text-red-700">
              Could not submit the report.
              Please try again.
            </p>
          )}

          

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          backgroundColor: "#176B63",
          color: "#FFFFFF",
        }}
        className="
          mt-2 w-full rounded-xl
          px-5 py-3
          text-base font-semibold
          shadow-md
          transition-all duration-200
          hover:brightness-95
          active:scale-[0.98]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#176B63]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {isSubmitting ? "Submitting..." : "Submit report"}
      </button>


        </form>
      )}
    </section>
  );
}
