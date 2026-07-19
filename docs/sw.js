// Service worker: precache the app shell, runtime-cache sprites so the app
// works offline after first load. Bump VERSION whenever shell files change.
const VERSION = "myteam-v65";

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

  const url = new URL(request.url);

  // Cross-origin assets (hotlinked showdown sprites, fonts): stale-while-
  // revalidate. These come back as opaque responses whose status can't be
  // read, so a failed fetch (a network blip or showdown rate-limit) looks
  // identical to success - under plain cache-first it would get cached as a
  // permanently broken sprite that every reload then re-serves. Revalidating in
  // the background instead means a bad entry heals itself on the next load.
  if (url.origin !== self.location.origin) {
    // Kick off the network refresh synchronously and keep the worker alive for
    // it with waitUntil (which must be called during dispatch, before any
    // await). It resolves only after the fresh copy is cached, so a stale or
    // broken entry is replaced for next time.
    const fresh = fetch(request)
      .then(async (response) => {
        if (response.ok || response.type === "opaque") {
          const cache = await caches.open(VERSION);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);
    event.waitUntil(fresh);
    // Serve the cached copy immediately if we have one, else wait on the network.
    event.respondWith(
      caches.match(request).then((cached) => cached || fresh.then((r) => r || Response.error()))
    );
    return;
  }

  // Same-origin shell + local sprites: cache first, fill from network on miss.
  // Only real successes (response.ok) are cached, so a 404 never sticks - the
  // next load retries it (e.g. an icon that wasn't deployed yet).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
