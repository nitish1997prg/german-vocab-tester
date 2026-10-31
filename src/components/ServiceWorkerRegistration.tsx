
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register only in production.
    // Avoid persistent service-worker caching
    // interfering with local Next.js development.
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((error) => {
        console.error(
          "Service worker registration failed:",
          error
        );
      });
  }, []);

  return null;
}
