import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";

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
});