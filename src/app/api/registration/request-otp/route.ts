import { RegisterSchema } from "@/lib/auth/auth-schemas";

import {
  savePendingRegistration,
} from "@/lib/auth/pending-registration";

import {
  issueRegistrationOTP,
} from "@/lib/auth/registration-otp";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.AUTH_OTP_ENABLED !== "true") {
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

  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid registration details" },
      { status: 400 }
    );
  }

  const { firstName, lastName, email } = parsed.data;

  try {
    // Registration must not create duplicate accounts.
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // NX prevents replacing an existing pending registration.
    await savePendingRegistration({
      firstName,
      lastName,
      email,
    });

    const result = await issueRegistrationOTP(email);

    if (result === "cooldown") {
      return Response.json(
        { error: "Please wait before requesting another code." },
        { status: 429 }
      );
    }

    if (result === "missing-pending") {
      return Response.json(
        { error: "Unable to start registration." },
        { status: 503 }
      );
    }

    return Response.json({
      message: "If eligible, a verification code will be sent.",
    });
  } catch (error) {
    console.error(
      "Registration OTP request failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return Response.json(
      { error: "Unable to process registration." },
      { status: 503 }
    );
  }
}
