
"use client";

import { useId, useState } from "react";
import type { ChangeEvent, ClipboardEvent } from "react";

import styles from "./otp-input.module.css";

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

const OTP_LENGTH = 6;

export function OTPInput({
  value,
  onChange,
  disabled = false,
  error,
}: OTPInputProps) {
  const inputId = useId();
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    onChange(digits);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    onChange(digits);
  }

  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  return (
    <div className={styles.root}>
      <label htmlFor={inputId} className={styles.label}>
        VERIFICATION CODE
      </label>

      <div className={styles.inputContainer}>
        <div className={styles.slots} aria-hidden="true">
          {Array.from({ length: OTP_LENGTH }, (_, index) => {
            const digit = value[index] ?? "";
            const active =
              isFocused && !disabled && index === activeIndex;

            return (
              <div
                key={index}
                className={[
                  styles.slot,
                  digit ? styles.filled : "",
                  active ? styles.active : "",
                  error ? styles.invalid : "",
                ].filter(Boolean).join(" ")}
              >
                {digit}
              </div>
            );
          })}
        </div>

        <input
          id={inputId}
          name="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={OTP_LENGTH}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={styles.input}
        />
      </div>

      {error ? (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p className={styles.hint}>
          Enter the six-digit code from your email.
        </p>
      )}
    </div>
  );
}
