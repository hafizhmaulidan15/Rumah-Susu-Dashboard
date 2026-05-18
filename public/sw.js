const CACHE = "rsi-static-v2";
const CACHEABLE = [
  "/_next/static/",
  "/icon-",
  "/og-image.png",
  "/manifest.json",
];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => k !== CACHE && caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/") || e.request.mode === "navigate") return;

  if (CACHEABLE.some((p) => url.pathname.startsWith(p))) {
    e.respondWith(
      caches.match(e.request).then((r) => r || fetchAndCache(e.request)),
    );
  }
});

async function fetchAndCache(request) {
  const res = await fetch(request);
  if (res.ok) {
    const clone = res.clone();
    caches.open(CACHE).then((cache) => cache.put(request, clone));
  }
  return res;
}
