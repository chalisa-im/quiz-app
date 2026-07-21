const CACHE_NAME = "quiz-app-cache-v16";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./storage.js",
  "./js/i18n.js",
  "./js/state.js",
  "./js/data.js",
  "./js/render-menu.js",
  "./js/review.js",
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

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;

  const isQuestionData = url.pathname.includes("/questions/") && url.pathname.endsWith(".json");

  if (isQuestionData) {
    // Network-first for question data (index.json + per-subject files).
    // Content here changes often as questions get added/translated, so we
    // always try the network first and only fall back to whatever's cached
    // if the device is offline. This avoids devices getting stuck forever
    // on an outdated snapshot of a subject's questions.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for the app shell (HTML/CSS/JS/icons). These only change
  // when we ship an update, at which point CACHE_NAME is bumped and the
  // old cache (with the old shell) is wiped on activate.
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
