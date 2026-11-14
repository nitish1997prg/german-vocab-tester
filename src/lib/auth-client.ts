"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, emailOTPClient } from "better-auth/client/plugins";

import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    emailOTPClient()
  ],
  sessionOptions: {
      refetchInterval: 60,
      refetchOnWindowFocus: true,
      refetchWhenOffline: false,
    },
});

export type AuthSession = typeof authClient.$Infer.Session;