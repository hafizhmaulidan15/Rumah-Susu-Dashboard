/** Bump when deploy changes caching behavior. */
const CACHE_NAME = "rsi-dashboard-v3";

const PRECACHE_ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      ),
  );
  self.clients.claim();
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html")
  );
}

/** Network-first: always try fresh HTML/JS; never serve stale app shell from cache. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error("Offline and no cache");
  }
}

/** API & Google Script: network only (no SW cache). */
async function networkOnly(request) {
  return fetch(request);
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    if (url.hostname.includes("script.google.com")) {
      event.respondWith(networkOnly(event.request));
    }
    return;
  }

  if (isApiRequest(url) || isNavigationRequest(event.request)) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
