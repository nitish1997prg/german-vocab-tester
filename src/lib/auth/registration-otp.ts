import "server-only";

import { createHmac, randomInt } from "node:crypto";
import { Redis } from "@upstash/redis";

import {
  getPendingRegistration,
  getRegistrationEmailHash,
  refreshPendingRegistrationTTL,
} from "@/lib/auth/pending-registration";

import { sendAuthEmail } from "@/lib/email/send-auth-email";

export const REGISTRATION_OTP_TTL_SECONDS = 300;
export const REGISTRATION_OTP_COOLDOWN_SECONDS = 60;

export type RegistrationOTPRecord = {
  codeHash: string;
  attempts: number;
  issuedAt: number;
};

export type IssueRegistrationOTPResult =
  | "sent"
  | "cooldown"
  | "missing-pending";

function hashOTP(email: string, otp: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is missing");
  }

  return createHmac("sha256", secret)
    .update(`registration:${email.trim().toLowerCase()}:${otp}`)
    .digest("hex");
}

export async function issueRegistrationOTP(
  email: string
): Promise<IssueRegistrationOTPResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const pending = await getPendingRegistration(normalizedEmail);

  if (!pending) {
    return "missing-pending";
  }

  const redis = Redis.fromEnv();

  const identifier = getRegistrationEmailHash(normalizedEmail);

  const cooldownKey =
    `auth:registration-otp-cooldown:${identifier}`;

  const otpKey =
    `auth:registration-otp:${identifier}`;

  // Atomically reserve the resend cooldown.
  const reserved = await redis.set(
    cooldownKey,
    "1",
    {
      ex: REGISTRATION_OTP_COOLDOWN_SECONDS,
      nx: true,
    }
  );

  if (reserved !== "OK") {
    return "cooldown";
  }

  const refreshed = await refreshPendingRegistrationTTL(
    normalizedEmail
  );

  if (!refreshed) {
    return "missing-pending";
  }

  // Cryptographically secure six-digit code.
  const otp = randomInt(0, 1_000_000)
    .toString()
    .padStart(6, "0");

  const record: RegistrationOTPRecord = {
    codeHash: hashOTP(normalizedEmail, otp),
    attempts: 0,
    issuedAt: Date.now(),
  };

  // Overwrites any previous registration OTP.
  await redis.set(otpKey, record, {
    ex: REGISTRATION_OTP_TTL_SECONDS,
  });

  await sendAuthEmail({
    to: normalizedEmail,
    subject: "Verify your German Vocabulary Tester account",
    text: [
      `Your registration code is: ${otp}`,
      "",
      "This code expires in 5 minutes.",
      "",
      "If you did not request this code, ignore this email.",
    ].join("\n"),
  });

  return "sent";
}