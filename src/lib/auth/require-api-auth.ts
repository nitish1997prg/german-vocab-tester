
import "server-only";

import { auth } from "@/lib/auth";

/**
 * Protect an application API endpoint.
 *
 * Returns null when the request may proceed.
 * Returns a Response when the request must be rejected.
 *
 * The feature flag preserves the existing production
 * behavior until we're ready for the auth rollout.
 */
export async function requireApiAuth(
  request: Request
): Promise<Response | null> {
  if (process.env.APP_AUTH_GUARD_ENABLED !== "true") {
    return null;
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return null;
  } catch {
    // Fail closed if session validation is unavailable.
    return Response.json(
      {
        error: "Authentication temporarily unavailable",
        code: "AUTH_UNAVAILABLE",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
