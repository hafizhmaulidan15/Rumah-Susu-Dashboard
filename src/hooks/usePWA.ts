"use client";

import { useEffect } from "react";

const SW_URL = "/sw.js";
const SW_CACHE_PREFIX = "rsi-static-";

export const usePWA = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    const isDev = process.env.NODE_ENV === "development";

    const init = async () => {
      const [registrations, cacheNames] = await Promise.all([
        navigator.serviceWorker.getRegistrations(),
        typeof caches !== "undefined" ? caches.keys() : [],
      ]);

      await Promise.all([
        ...registrations.map((r) => {
          if (isDev || !r.active?.scriptURL?.endsWith(SW_URL)) {
            return r.unregister();
          }
        }),
        ...cacheNames
          .filter((n) => !n.startsWith(SW_CACHE_PREFIX))
          .map((n) => caches.delete(n)),
      ]).catch(() => {});

      if (!isDev) {
        try {
          await navigator.serviceWorker.register(SW_URL);
        } catch {}
      }
    };

    init();
  }, []);
};
