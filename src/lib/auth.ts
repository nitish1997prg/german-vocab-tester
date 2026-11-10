import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { loginEmailOTP } from "@/lib/auth-plugins/email-otp";
import { registrationSessionPlugin } from "@/lib/auth-plugins/registration-session";

import { prisma } from "@/lib/prisma";

const otpEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.AUTH_OTP_ENABLED === "true";

export const auth = betterAuth({
  appName: "German Vocabulary Tester",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: false,
  },

  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },

      lastName: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: otpEnabled
    ? [
        loginEmailOTP,
        registrationSessionPlugin(),
      ]
    : [],
});