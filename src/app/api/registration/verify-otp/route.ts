import { randomUUID } from "node:crypto";

import { VerifyOtpSchema } from "@/lib/auth/auth-schemas";

import {
  getPendingRegistration,
  clearPendingRegistration,
} from "@/lib/auth/pending-registration";

import {
  verifyAndConsumeRegistrationOTP,
} from "@/lib/auth/registration-otp";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(request: Request) {
  // Registration remains local-development only.
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.AUTH_OTP_ENABLED !== "true"
  ) {
    return new Response(null, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = VerifyOtpSchema.safeParse(body);

  if (!parsed.success || parsed.data.flow !== "registration") {
    return Response.json(
      { error: "Invalid registration verification request" },
      { status: 400 }
    );
  }

  const { email, code } = parsed.data;

  try {
    // Registration details must still exist.
    const pending = await getPendingRegistration(email);

    if (!pending) {
      return Response.json(
        { error: "Registration expired. Please start again." },
        { status: 400 }
      );
    }

    // Atomically verify and consume the OTP.
    const result = await verifyAndConsumeRegistrationOTP(
      email,
      code
    );

    if (result === "locked") {
      return Response.json(
        { error: "Too many incorrect attempts." },
        { status: 429 }
      );
    }

    if (result !== "verified") {
      return Response.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const now = new Date();

    const name = [
      pending.firstName,
      pending.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    // This is the first permanent database write.
    try {
      await prisma.user.create({
        data: {
          id: randomUUID(),
          name,
          firstName: pending.firstName,
          lastName: pending.lastName,
          email: pending.email,
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return Response.json(
          { error: "Registration could not be completed." },
          { status: 409 }
        );
      }

      throw error;
    }

    // Successful registration: remove temporary details.
    try {
      await clearPendingRegistration(email);
    } catch {
      // The temporary record will still expire via Redis TTL.
      console.warn("Pending registration cleanup deferred.");
    }

    return Response.json(
      {
        success: true,
        message: "Registration completed successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Registration verification failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return Response.json(
      { error: "Unable to complete registration." },
      { status: 503 }
    );
  }
}