
"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

import styles from "./session-expiry-guard.module.css";

type SessionExpiryGuardProps = {
  children: ReactNode;
};

export function SessionExpiryGuard({
  children,
}: SessionExpiryGuardProps) {
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = authClient.useSession();

  const redirecting = useRef(false);

  useEffect(() => {
    if (
      isPending ||
      error ||
      session?.user ||
      redirecting.current
    ) {
      return;
    }

    redirecting.current = true;

    // Full navigation prevents stale application
    // UI from remaining visible.
    window.location.replace("/login");
  }, [isPending, error, session?.user]);

  if (isPending) {
    return (
      <div className={styles.centered} role="status">
        <p className={styles.label}>German Vocab</p>
        <h2>Checking your session...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered} role="alert">
        <p className={styles.label}>CONNECTION ERROR</p>

        <h2>Unable to verify your session.</h2>

        <p>
          Please check your connection and try again.
        </p>

        <button
          type="button"
          className={styles.button}
          onClick={() => void refetch()}
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className={styles.centered} role="status">
        <p className={styles.label}>SESSION ENDED</p>
        <h2>Redirecting to login...</h2>
      </div>
    );
  }

  return <>{children}</>;
}
