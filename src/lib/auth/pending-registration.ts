import "server-only";

import { createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";

export const PENDING_REGISTRATION_TTL_SECONDS = 300;

export type PendingRegistrationInput = {
  firstName: string;
  lastName?: string | null;
  email: string;
};

export type PendingRegistration = {
  firstName: string;
  lastName: string | null;
  email: string;
  createdAt: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getRedis() {
  return Redis.fromEnv();
}

export function getRegistrationEmailHash(
  email: string
): string {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is missing");
  }

  return createHmac("sha256", secret)
    .update(email.trim().toLowerCase())
    .digest("hex");
}

function getPendingRegistrationKey(
  email: string
): string {
  return (
    "auth:pending-registration:" +
    getRegistrationEmailHash(email)
  );
}

export async function refreshPendingRegistrationTTL(
  email: string
): Promise<boolean> {
  const result = await getRedis().expire(
    getPendingRegistrationKey(email),
    PENDING_REGISTRATION_TTL_SECONDS
  );

  return result === 1;
}

export async function savePendingRegistration(
  input: PendingRegistrationInput
): Promise<boolean> {
  const email = normalizeEmail(input.email);

  const pending: PendingRegistration = {
    firstName: input.firstName.trim(),
    lastName: input.lastName?.trim() || null,
    email,
    createdAt: Date.now(),
  };

  const result = await getRedis().set(
    getPendingRegistrationKey(email),
    pending,
    {
      ex: PENDING_REGISTRATION_TTL_SECONDS,
      nx: true,
    }
  );

  return result === "OK";
}

export async function getPendingRegistration(
  email: string
): Promise<PendingRegistration | null> {
  return getRedis().get<PendingRegistration>(
    getPendingRegistrationKey(email)
  );
}