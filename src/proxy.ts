
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const PUBLIC_PAGES = new Set([
  "/login",
  "/register",
]);

const PUBLIC_API_ROUTES = new Set([
  "/api/registration/request-otp",
]);

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PAGES.has(pathname)) {
    return true;
  }

  // Better Auth manages login, logout, and sessions.
  if (
    pathname === "/api/auth" ||
    pathname.startsWith("/api/auth/")
  ) {
    return true;
  }

  // Registration OTP requests must work before login.
  if (PUBLIC_API_ROUTES.has(pathname)) {
    return true;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  // Temporary feature flag during development.
  const enabled =
    process.env.APP_AUTH_GUARD_ENABLED === "true";

  if (!enabled) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  let session;

  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch {
    // Fail closed if session validation is unavailable.
    return new NextResponse(
      "Authentication service temporarily unavailable.",
      { status: 503 }
    );
  }

  if (session?.user) {
    return NextResponse.next();
  }

  // APIs must return an HTTP error, not an HTML redirect.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.redirect(
    new URL("/login", request.url)
  );
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|\\.well-known/).*)",
  ],
};
