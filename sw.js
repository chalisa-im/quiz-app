const CACHE_NAME = "quiz-app-cache-v11";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./storage.js",
  "./js/i18n.js",
  "./js/state.js",
  "./js/data.js",
  "./js/render-menu.js",
  "./js/quiz.js",
  "./js/answers.js",
  "./js/result.js",
  "./js/main.js",
  "./questions/index.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for same-origin requests (app shell + per-subject question
// files), falling back to network and caching the response as it comes in.
// This means question JSON only needs to be downloaded once per device.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
