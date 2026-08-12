// Minimal service worker: makes the app installable and gives it an offline
// shell. Deliberately network-first — this app is all about *live* data, so
// we never want a cached standings table winning over a fresh one.

// Bump this whenever a cached shell asset changes — the activate handler
// deletes every cache that isn't the current name, so anyone who has already
// visited picks the new files up instead of keeping the old ones forever.
const CACHE = "epl-2026-27-v2";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-32.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch the API — live data and the event stream go straight through.
  if (url.pathname.startsWith("/api/")) return;

  // Cross-origin (fonts, team crests): cache-first, they're immutable enough.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request)
            .then((res) => {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
              return res;
            })
            .catch(() => hit)
      )
    );
    return;
  }

  // Same-origin: network-first, fall back to cache when offline.
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match("/index.html")))
  );
});
