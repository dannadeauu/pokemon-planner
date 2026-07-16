// Service worker: precache the app shell, runtime-cache sprites so the app
// works offline after first load. Bump VERSION whenever shell files change.
const VERSION = "myteam-v36";

const SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./shiny_sparkle.webp",
  "./safari_ball.png",
  "./sig_swablu.png",
  "./sig_altaria.png",
  "./sig_altaria_mega.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // "reload" bypasses the HTTP cache so a new shell version can never be
      // precached from stale heuristically-cached copies of its files.
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Navigations: network first so updates land, cached shell as offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Everything else (shell files, local sprites, hotlinked showdown gifs,
  // fonts): cache first, fill the cache from the network on miss.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok || response.type === "opaque") {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
