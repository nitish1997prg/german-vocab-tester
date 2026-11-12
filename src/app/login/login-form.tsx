
"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { jakarta, mono } from "@/lib/fonts";

import { LoginSchema } from "@/lib/auth/auth-schemas";
import { authClient } from "@/lib/auth-client";
import { OTPInput } from "@/components/auth/otp-input";

import styles from "./login.module.css";

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [loginComplete, setLoginComplete] = useState(false);

  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState("");

  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(0);

  useEffect(() => {
    if (!sentEmail || loginComplete || otpSentAt === null) {
      return;
    }

    const interval = window.setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sentEmail, loginComplete, otpSentAt]);

  const secondsUntilResend =
    otpSentAt === null
      ? 0
      : Math.max(
          0,
          Math.ceil((otpSentAt + 60_000 - clockNow) / 1000)
        );

  const secondsUntilExpiry =
    otpSentAt === null
      ? 0
      : Math.max(
          0,
          Math.ceil((otpSentAt + 300_000 - clockNow) / 1000)
        );

  const isOtpExpired =
    otpSentAt !== null && secondsUntilExpiry === 0;

  function startOtpCountdown() {
    const now = Date.now();

    setOtpSentAt(now);
    setClockNow(now);
  }

  async function handleVerifyLogin() {
    if (
      !sentEmail ||
      !/^\d{6}$/.test(otp) ||
      isVerifying ||
      isResending ||
      isOtpExpired ||
      loginComplete
    ) {
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const { error: authError } = await authClient.signIn.emailOtp({
        email: sentEmail,
        otp,
      });

      if (authError) {
        setVerificationError(
          authError.status === 429
            ? "Too many attempts. Please try again later."
            : "Unable to verify your code. Please check it and try again."
        );
        return;
      }

      setLoginComplete(true);
    } catch {
      setVerificationError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSending) return;

    setError("");

    const parsed = LoginSchema.safeParse({ email });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Please enter a valid email address."
      );
      return;
    }

    const normalizedEmail = parsed.data.email;

    setIsSending(true);

    try {
      const { error: authError } =
        await authClient.emailOtp.sendVerificationOtp({
          email: normalizedEmail,
          type: "sign-in",
        });

      if (authError) {
        setError(
          authError.status === 429
            ? "Too many requests. Please try again later."
            : "Unable to request a verification code. Please try again."
        );
        return;
      }

      setSentEmail(normalizedEmail);
      setOtp("");
      setVerificationError("");
      setResendError("");
      startOtpCountdown();
    } catch {
      setError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSending(false);
    }
  }


  async function handleResendLoginOtp() {
    if (
      !sentEmail ||
      isResending ||
      isVerifying ||
      loginComplete ||
      otpSentAt === null ||
      secondsUntilResend > 0
    ) {
      return;
    }

    setIsResending(true);
    setResendError("");

    try {
      const { error: authError } =
        await authClient.emailOtp.sendVerificationOtp({
          email: sentEmail,
          type: "sign-in",
        });

      if (authError) {
        if (authError.status === 429) {
          setResendError(
            "Too many requests. Please try again later."
          );
        } else {
          setResendError(
            "Unable to resend the code. " +
            "Please try again when permitted."
          );
        }

        return;
      }

      // Better Auth rotates the OTP on a successful resend.
      // Clear the previously entered code.
      setOtp("");
      setVerificationError("");
      setResendError("");

      startOtpCountdown();
    } catch {
      setResendError(
        "Network error. The previous code may no longer work. " +
        "Please try requesting a new code."
      );
    } finally {
      setIsResending(false);
    }
  }


  return (
    <main className={`${styles.page} ${jakarta.className}`}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span>German Vocab<span className={styles.brandDot}>.</span></span>
          </div>

          <span className={`${styles.stepLabel} ${mono.className}`}>
            LOGIN / {loginComplete ? "03" : sentEmail ? "02" : "01"}
          </span>
        </header>

          {sentEmail ? (
    <section className={styles.content}>
      <div className={styles.successSymbol} aria-hidden="true">
        {loginComplete ? "✓" : "✉"}
      </div>

      <h1 className={styles.title}>
        {loginComplete
          ? "Welcome back."
          : "Check your inbox."}
      </h1>

      {loginComplete ? (
        <>
          <p className={styles.description} role="status">
            You&apos;re signed in successfully.
          </p>

          <Link href="/" className={styles.verifyButton}>
            CONTINUE TO APP
          </Link>
        </>
      ) : (
        <>
          <p className={styles.description}>
            If an account exists for this address,
            you&apos;ll receive a six-digit login code.
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
              disabled={isVerifying || isResending}
              error={verificationError || undefined}
            />
          </div>

          <button
            type="button"
            className={styles.verifyButton}
            onClick={handleVerifyLogin}
            disabled={
              otp.length !== 6 ||
              isVerifying ||
              isResending ||
              isOtpExpired
            }
          >
            {isVerifying
              ? "VERIFYING..."
              : "VERIFY LOGIN"}
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
                RESEND AVAILABLE IN{" "}
                {formatCountdown(secondsUntilResend)}
              </p>
            ) : (
              <button
                type="button"
                className={styles.resendButton}
                onClick={handleResendLoginOtp}
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
              setError("");
              setOtpSentAt(null);
              setClockNow(0);
              setOtp("");
              setResendError("");
              setVerificationError("");
            }}
          >
            USE ANOTHER EMAIL
          </button>
        </>
      )}
    </section>
  ) : (
          <section className={styles.content}>
            <div className={styles.decorations} aria-hidden="true">
              <span className={styles.circle} />
              <span className={styles.square} />
              <span className={styles.bar} />
            </div>

            <h1 className={styles.title}>
              Welcome back.
            </h1>

            <p className={styles.description}>
              Sign in to German Vocab with a one-time
              code sent to your email.
            </p>

            <form
              onSubmit={handleSubmit}
              className={styles.form}
              noValidate
            >
              <div className={styles.field}>
                <label
                  htmlFor="login-email"
                  className={styles.label}
                >
                  EMAIL ADDRESS
                </label>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  maxLength={254}
                  required
                  disabled={isSending}
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? "login-error" : undefined
                  }
                  className={styles.input}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                />
              </div>

              {error && (
                <p
                  id="login-error"
                  className={styles.error}
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSending}
              >
                {isSending
                  ? "SENDING CODE..."
                  : "SEND SIGN-IN CODE"}
              </button>
            </form>

            <div className={styles.footer}>
              <p>NEW TO GERMAN VOCAB?</p>

              <Link
                href="/register"
                className={styles.registerLink}
              >
                CREATE AN ACCOUNT
              </Link>
            </div>
          </section>
        )}
      </div>

      <p className={styles.pageFooter}>
        LEARN WORDS. BUILD KNOWLEDGE.
      </p>
    </main>
  );
}
