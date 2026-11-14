"use client";

import { useState,useEffect, type FormEvent } from "react";
import Link from "next/link";
import { jakarta, mono } from "@/lib/fonts";

import { RegisterSchema } from "@/lib/auth/auth-schemas";

import styles from "./register.module.css";

import { OTPInput } from "@/components/auth/otp-input";

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

  const [otp, setOtp] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState("");

  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!sentEmail || registrationComplete) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sentEmail, registrationComplete]);

  const secondsUntilResend = otpSentAt === null
    ? 0
    : Math.max(0, Math.ceil((otpSentAt + 60_000 - now) / 1000));

  const secondsUntilExpiry = otpSentAt === null
    ? 0
    : Math.max(0, Math.ceil((otpSentAt + 300_000 - now) / 1000));

  const isOtpExpired = secondsUntilExpiry === 0;

  function formatCountdown(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function startOtpCountdown() {
    const currentTime = Date.now();

    setOtpSentAt(currentTime);
    setNow(currentTime);
  }

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
      startOtpCountdown();
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


  async function handleVerifyRegistration() {
    if (
      !sentEmail ||
      !/^\d{6}$/.test(otp) ||
      isVerifying ||
      registrationComplete
    ) {
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const response = await fetch(
        "/api/auth/registration/complete",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flow: "registration",
            email: sentEmail,
            code: otp,
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        code?: string;
      } | null;

      if (!response.ok || data?.success !== true) {
        if (response.status === 429) {
          setVerificationError(
            data?.message ??
              "Too many attempts. Request a new code."
          );
          return;
        }

        if (response.status >= 500) {
          setVerificationError(
            data?.message ??
              "Verification could not be completed. " +
                "Please check your account status before retrying."
          );
          return;
        }

        setVerificationError(
          data?.message ??
            "Invalid or expired verification code."
        );
        return;
      }

      // Registration succeeded and Better Auth issued the session.
      setRegistrationComplete(true);
      setOtp("");

      // Full navigation ensures the protected app loads
      // using the newly issued session cookie.
      window.location.replace("/");
    } catch {
      setVerificationError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  }


  async function handleResendOtp() {
    if (
      !sentEmail ||
      isResending ||
      isVerifying ||
      registrationComplete ||
      secondsUntilResend > 0
    ) {
      return;
    }

    setIsResending(true);
    setResendError("");

    try {
      const response = await fetch(
        "/api/registration/request-otp",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName: lastName?.trim() || undefined,
            email: sentEmail,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          setResendError(
            "Please wait before requesting another code."
          );
          return;
        }

        setResendError(
          "We couldn't send a new code. " +
          "Your previous code may no longer work. " +
          "Please try again after the cooldown."
        );
        return;
      }

      // A new OTP invalidates the previous one.
      setOtp("");
      setVerificationError("");
      setResendError("");

      startOtpCountdown();
    } catch {
      setResendError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsResending(false);
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
          {sentEmail ?  (
    <div className={styles.success}>
    <span className={`${styles.stepLabel} ${mono.className}`}>
      REGISTRATION / {registrationComplete ? "03" : "02"}
    </span>

    <div className={styles.successSymbol}>
      {registrationComplete ? "✓" : "✉"}
    </div>

    <h1 className={styles.title}>
      {registrationComplete
        ? "You're in."
        : "Check your inbox."}
    </h1>

    {registrationComplete ? (
      <>
        <p
          className={styles.description}
          role="status"
        >
          Your email has been verified and your account
          has been created successfully.
        </p>

        <Link
          href="/"
          className={styles.verifyButton}
        >
          CONTINUE TO APP
        </Link>
      </>
    ) : (
      <>
        <p className={styles.description}>
          We sent a six-digit verification code to:
        </p>

        <p className={styles.sentEmail}>
          {sentEmail}
        </p>

        <div className={styles.otpSection}>
          <OTPInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setVerificationError("");
            }}
            disabled={isVerifying}
            error={verificationError || undefined}
          />
        </div>

        <button
          type="button"
          className={styles.verifyButton}
          onClick={handleVerifyRegistration}
          disabled={otp.length !== 6 || isVerifying || isResending || isOtpExpired}
        >
          {isVerifying
            ? "VERIFYING..."
            : "VERIFY EMAIL"}
        </button>

        
      <div className={styles.otpTiming}>
        <p className={styles.helpText} role="timer">
          {isOtpExpired
            ? "Your verification code has expired."
            : `Code expires in ${formatCountdown(secondsUntilExpiry)}`}
        </p>

        <div className={styles.resendSection}>
          {secondsUntilResend > 0 ? (
            <p className={styles.resendCountdown}>
              RESEND AVAILABLE IN {formatCountdown(secondsUntilResend)}
            </p>
          ) : (
            <button
              type="button"
              className={styles.resendButton}
              onClick={handleResendOtp}
              disabled={isResending || isVerifying}
            >
              {isResending ? "SENDING..." : "RESEND CODE"}
            </button>
          )}
        </div>

        {resendError && (
          <p className={styles.resendError} role="alert">
            {resendError}
          </p>
        )}
      </div>


        <button
          type="button"
          className={styles.secondaryButton}
          disabled={isVerifying}
          onClick={() => {
            setSentEmail(null);
            setOtp("");
            setServerError("");
            setVerificationError("");
          }}
        >
          USE ANOTHER EMAIL
        </button>
      </>
    )}
  </div>
)  : (
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
