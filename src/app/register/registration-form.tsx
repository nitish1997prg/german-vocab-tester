"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { jakarta, mono } from "@/lib/fonts";

import { RegisterSchema } from "@/lib/auth/auth-schemas";

import styles from "./register.module.css";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export default function RegistrationForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setErrors({});
    setServerError("");

    const parsed = RegisterSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim().toLowerCase(),
    });

    // Validate locally before calling the API.
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (
          field === "firstName" ||
          field === "lastName" ||
          field === "email"
        ) {
          fieldErrors[field] ??= issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/registration/request-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "same-origin",

          body: JSON.stringify(parsed.data),
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "An account with this email already exists. Please use another email."
          );
        }

        if (response.status === 429) {
          throw new Error(
            "A code was recently requested. Please wait a minute before trying again."
          );
        }

        if (response.status === 503) {
          throw new Error(
            "Email delivery is temporarily unavailable. Please try again shortly."
          );
        }

        if (response.status === 400) {
          throw new Error(
            "Please check your registration details."
          );
        }

        throw new Error(
          "We couldn't send your verification code. Please try again."
        );
      }

      // The server accepted the registration OTP request.
      setSentEmail(parsed.data.email);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`${styles.page} ${jakarta.className}`} >
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="German Vocab home">
            <span className={styles.brandName}>
              German Vocab<span className={styles.brandDot}>.</span>
            </span>
          </Link>
        </header>

        <section className={styles.card}>
          {sentEmail ? (
            <div
              className={styles.success}
              role="status"
              aria-live="polite"
            >
              <span className={`${styles.stepLabel} ${mono.className}`}>
                REGISTRATION / 02
              </span>

              <div className={styles.successSymbol}>
                ✓
              </div>

              <h1 className={styles.title}>
                Check your inbox.
              </h1>

              <p className={styles.description}>
                We sent a six-digit verification code to:
              </p>

              <p className={styles.sentEmail}>
                {sentEmail}
              </p>

              <p className={styles.helpText}>
                Your code expires in five minutes.
              </p>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setSentEmail(null);
                  setServerError("");
                }}
              >
                USE ANOTHER EMAIL
              </button>
            </div>
          ) : (
            <>
              <span className={`${styles.stepLabel} ${mono.className}`}>
                REGISTRATION / 01
              </span>

              <h1 className={styles.title}>
                Start learning.
              </h1>

              <p className={styles.description}>
                Create your account to begin your
                German vocabulary journey.
              </p>

              <form
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className={styles.field}>
                  <label
                    htmlFor="firstName"
                    className={styles.label}
                  >
                    FIRST NAME <span aria-hidden="true">*</span>
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    maxLength={100}
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    placeholder="Nitish"
                    className={styles.input}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={
                      errors.firstName
                        ? "firstName-error"
                        : undefined
                    }
                    required
                  />

                  {errors.firstName && (
                    <p
                      id="firstName-error"
                      className={styles.fieldError}
                    >
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label
                    htmlFor="lastName"
                    className={styles.label}
                  >
                    LAST NAME{" "}
                    <span className={styles.optional}>
                      (OPTIONAL)
                    </span>
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    maxLength={100}
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    placeholder="Viraktamath"
                    className={styles.input}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={
                      errors.lastName
                        ? "lastName-error"
                        : undefined
                    }
                  />

                  {errors.lastName && (
                    <p
                      id="lastName-error"
                      className={styles.fieldError}
                    >
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label
                    htmlFor="email"
                    className={styles.label}
                  >
                    EMAIL ADDRESS{" "}
                    <span aria-hidden="true">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    className={styles.input}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email
                        ? "email-error"
                        : undefined
                    }
                    required
                  />

                  {errors.email && (
                    <p
                      id="email-error"
                      className={styles.fieldError}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {serverError && (
                  <div className={styles.serverError} role="alert">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "SENDING CODE..."
                    : "SEND VERIFICATION CODE"}
                </button>
              </form>

              <p className={styles.footerText}>
                No password needed. We&apos;ll verify your
                email with a one-time code.
              </p>
            </>
          )}
        </section>

        <p className={styles.bottomLabel}>
          LEARN WORDS. BUILD KNOWLEDGE.
        </p>
      </div>
    </main>
  );
}
