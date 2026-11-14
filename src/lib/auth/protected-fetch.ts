
import { authClient } from "@/lib/auth-client";

/**
 * For same-origin, authentication-protected
 * application APIs only.
 */
export async function protectedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
  });

  if (response.status !== 401) {
    return response;
  }

  // A 401 might come from application authorization,
  // rather than an expired session.
  // Confirm the actual authentication state.
  try {
    const { data, error } = await authClient.getSession({
      query: {
        disableCookieCache: true,
      },
    });

    if (!error && !data?.user) {
      window.location.replace("/login");
    }
  } catch {
    // A temporary authentication-service failure
    // must not be mistaken for session expiry.
  }

  return response;
}
