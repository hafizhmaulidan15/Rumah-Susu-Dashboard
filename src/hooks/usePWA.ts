"use client";

import { useEffect } from "react";

export const usePWA = () => {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err);
      });
    }
  }, []);
};
