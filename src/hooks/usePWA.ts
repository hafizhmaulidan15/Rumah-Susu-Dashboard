"use client";

import { useEffect } from "react";

/** Bump when purge/migration logic changes (forces one reload for returning users). */
const SW_MIGRATION_VERSION = "5";

const PURGE_STORAGE_KEY = "rsi_sw_migration_v";

function debugLog(
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
) {
  // #region agent log
  fetch("http://127.0.0.1:7857/ingest/04bbbc38-ec50-479e-a135-12fcaea7d795", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "18a961",
    },
    body: JSON.stringify({
      sessionId: "18a961",
      location: "usePWA.ts",
      message,
      data,
      hypothesisId,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

/**
 * Removes legacy PWA service workers that cached HTML/API (root cause of stale UI after deploy).
 * Does NOT register a new service worker.
 */
export const usePWA = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const migrate = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const cacheNames =
        typeof caches !== "undefined" ? await caches.keys() : [];

      debugLog(
        "sw-migration-check",
        {
          registrationCount: registrations.length,
          cacheCount: cacheNames.length,
          controllerScript:
            navigator.serviceWorker.controller?.scriptURL ?? null,
        },
        "H1",
      );

      const needsCleanup = registrations.length > 0 || cacheNames.length > 0;

      if (needsCleanup) {
        await Promise.all(registrations.map((r) => r.unregister()));
        await Promise.all(cacheNames.map((name) => caches.delete(name)));

        localStorage.setItem(PURGE_STORAGE_KEY, SW_MIGRATION_VERSION);

        debugLog(
          "sw-migration-reload",
          {
            registrationCount: registrations.length,
            cacheCount: cacheNames.length,
          },
          "H1",
        );
        window.location.reload();
        return;
      }

      localStorage.setItem(PURGE_STORAGE_KEY, SW_MIGRATION_VERSION);
    };

    migrate().catch((err) => {
      console.warn("[SW migration]", err);
      debugLog("sw-migration-error", { error: String(err) }, "H1");
    });
  }, []);
};
