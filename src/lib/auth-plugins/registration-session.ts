import { randomUUID } from "node:crypto";

import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";

import { prisma } from "@/lib/prisma";
import { VerifyOtpSchema } from "@/lib/auth/auth-schemas";

import {
  getPendingRegistration,
  clearPendingRegistration,
} from "@/lib/auth/pending-registration";

import {
  verifyAndConsumeRegistrationOTP,
} from "@/lib/auth/registration-otp";

export const registrationSessionPlugin = () =>
  ({
    id: "registration-session",

    endpoints: {
      completeRegistration: createAuthEndpoint(
        "/registration/complete",
        {
          method: "POST",
          body: VerifyOtpSchema,
        },
        async (ctx) => {
          const { flow, email, code } = ctx.body;

          if (flow !== "registration") {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid verification flow.",
            });
          }

          // 1. Retrieve the pending registration.
          const pending = await getPendingRegistration(email);

          if (!pending) {
            throw new APIError("BAD_REQUEST", {
              message: "Registration expired. Please start again.",
            });
          }

          // 2. Atomically verify and consume the registration OTP.
          const result = await verifyAndConsumeRegistrationOTP(
            email,
            code
          );

          if (result !== "verified") {
            throw new APIError(
              result === "locked" ? "TOO_MANY_REQUESTS" : "BAD_REQUEST",
              {
                message:
                  result === "locked"
                    ? "Too many attempts. Request a new OTP."
                    : result === "expired"
                      ? "OTP expired. Request a new OTP."
                      : "Incorrect OTP.",
              }
            );
          }

          // 3. Only a verified OTP can reach user creation.
          const now = new Date();

          let user;

          try {
            user = await prisma.user.create({
              data: {
                id: randomUUID(),
                email,
                emailVerified: true,

                firstName: pending.firstName,
                lastName: pending.lastName ?? null,

                name: [
                  pending.firstName,
                  pending.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),

                createdAt: now,
                updatedAt: now,
              },
            });
          } catch (error) {
            if (
              error instanceof Error &&
              "code" in error &&
              error.code === "P2002"
            ) {
              throw new APIError("CONFLICT", {
                message: "An account already exists for this email.",
              });
            }

            throw error;
          }

          // 4. Clear pending registration data.
          // The consumed OTP cannot be reused even if cleanup fails.
          try {
            await clearPendingRegistration(email);
          } catch (error) {
            console.error(
              "Pending registration cleanup failed:",
              error
            );
          }

          // 5. Ask Better Auth to create the session.
          const session =
            await ctx.context.internalAdapter.createSession(user.id);

          if (!session) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message:
                "Account created, but automatic sign-in failed.",
            });
          }

          // 6. Set the Better Auth session cookie.
          await setSessionCookie(ctx, {
            session,
            user,
          });

          // Never return the raw session token to the client.
          return ctx.json({
            success: true,
            message: "Registration completed successfully.",
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          });
        }
      ),
    },
  }) satisfies BetterAuthPlugin;