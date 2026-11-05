
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
      <div
        role="status"
        className="
          flex w-full items-start gap-3
          rounded-xl border
          border-emerald-500/30
          bg-emerald-500/10
          p-4 text-sm
          text-emerald-300
        "
      >
        <span aria-hidden="true">✓</span>

        <p className="leading-relaxed">
          Report received. Thank you for helping
          us improve the questions.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Question reporting"
      className="w-full"
    >
      {/* Collapsed report trigger */}
      <button
        type="button"
        aria-expanded={isOpen}
        disabled={isSubmitting}
        onClick={() => {
          setIsOpen((current) => !current);
          setStatus("idle");
        }}
        className="
          mx-auto flex min-h-11
          items-center justify-center
          gap-2 rounded-lg
          px-3 py-2
          text-xs font-medium
          text-gray-400
          transition-colors
          hover:text-amber-400
          disabled:cursor-not-allowed
          disabled:opacity-60
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-amber-400
        "
      >
        <span aria-hidden="true" className="text-base">
          ⚑
        </span>

        <span>Report question</span>

        <span
          aria-hidden="true"
          className={`
            inline-block text-sm
            transition-transform duration-200
            motion-reduce:transition-none
            ${isOpen ? "rotate-180" : ""}
          `}
        >
          ▾
        </span>
      </button>

      {/* Expanded report form */}
      {isOpen && (
        <form
          onSubmit={submitReport}
          className="
            wm-feedback-enter
            mt-3 flex w-full flex-col gap-4
            rounded-2xl border
            border-[var(--wm-border)]
            bg-[var(--wm-surface)]
            p-4
          "
        >
          {/* Form heading */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">
              Report this question
            </h3>

            <p className="text-xs leading-relaxed text-gray-400">
              Help us improve the quality of
              AI-generated vocabulary questions.
            </p>
          </div>

          {/* Report reason */}
          <div className="space-y-2">
            <label
              htmlFor="report-reason"
              className="
                block text-sm
                font-semibold text-gray-200
              "
            >
              Why are you reporting it?
            </label>

            <select
              id="report-reason"
              value={reason}
              disabled={isSubmitting}
              onChange={(event) =>
                setReason(
                  event.target.value as ReportReason
                )
              }
              className="
                min-h-12 w-full
                rounded-xl border
                border-[#3A425A]
                bg-[var(--wm-surface-raised)]
                px-3 py-3 text-sm
                text-white
                outline-none
                transition-colors
                focus:border-amber-500
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-amber-400
                disabled:opacity-60
              "
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
          </div>

          {/* Error feedback */}
          {status === "error" && (
            <div
              role="alert"
              className="
                rounded-xl border
                border-rose-500/30
                bg-rose-500/10
                p-3 text-sm
                leading-relaxed
                text-rose-300
              "
            >
              Could not submit the report.
              Please try again.
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              flex min-h-12 w-full
              items-center justify-center
              gap-2 rounded-xl
              bg-amber-500
              px-5 py-3
              text-sm font-extrabold
              text-[#0F1117]
              shadow-[0_6px_20px_-10px_rgba(245,158,11,0.5)]
              transition-[background-color,transform]
              duration-200
              hover:bg-amber-400
              motion-safe:active:scale-[0.98]
              motion-reduce:transition-none
              disabled:cursor-not-allowed
              disabled:opacity-60
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-amber-400
            "
          >
            {isSubmitting
              ? "Submitting..."
              : "Submit Report"}
          </button>
        </form>
      )}
    </section>
  );
}
