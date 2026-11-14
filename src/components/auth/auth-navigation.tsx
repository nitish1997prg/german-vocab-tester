
"use client";

import { useState } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import styles from "./auth-navigation.module.css";

const authUiEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_AUTH_UI_ENABLED === "true";

export function AuthNavigation() {
  if (!authUiEnabled) {
    return null;
  }

  return <AuthNavigationEnabled />;
}

function AuthNavigationEnabled() {
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = authClient.useSession();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setSignOutError(
          "Unable to sign out. Please try again."
        );
        return;
      }

      // Full navigation refreshes server-rendered
      // content after the session cookie is cleared.
      window.location.assign("/");
    } catch {
      setSignOutError(
        "Network error. Please try again."
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isPending) {
    return (
      <nav
        className={styles.root}
        aria-label="Account navigation"
        aria-busy="true"
      >
        <span className={styles.loading}>
          CHECKING SESSION...
        </span>
      </nav>
    );
  }

  if (error) {
    return (
      <nav
        className={styles.root}
        aria-label="Account navigation"
      >
        <span className={styles.error}>
          SESSION UNAVAILABLE
        </span>

        <button
          type="button"
          className={styles.outlineButton}
          onClick={() => void refetch()}
        >
          RETRY
        </button>
      </nav>
    );
  }

  if (!session?.user) {
    return (
      <nav
        className={styles.root}
        aria-label="Account navigation"
      >
        <Link href="/login" className={styles.outlineButton}>
          LOG IN
        </Link>

        <Link href="/register" className={styles.primaryButton}>
          REGISTER
        </Link>
      </nav>
    );
  }

  const firstName =
    session.user.firstName?.trim() ||
    session.user.name?.trim().split(/\s+/)[0] ||
    "USER";

  return (
    <div className={styles.account}>
      <nav
        className={styles.root}
        aria-label="Account navigation"
      >
        <span className={styles.userName}>
          HI, {firstName}
        </span>

        <button
          type="button"
          className={styles.outlineButton}
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "SIGNING OUT..." : "LOG OUT"}
        </button>
      </nav>

      {signOutError && (
        <p className={styles.error} role="alert">
          {signOutError}
        </p>
      )}
    </div>
  );
}
