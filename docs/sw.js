// Service worker: precache the app shell, runtime-cache sprites so the app
// works offline after first load. Bump VERSION whenever shell files change.
const VERSION = "myteam-v125";

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

  // Cross-origin DATA fetches (Spotify Web API, lrclib lyrics) must always hit
  // the network live: caching them replayed stale responses — a cached "nothing
  // playing" (204) or an old snapshot got re-served on every poll, so the player
  // showed "play something…" / the wrong song while music was playing, and
  // lyrics stuck to the wrong track. Only genuine static assets (hotlinked
  // sprites, fonts) are cacheable; a fetch()'d API call has an empty
  // `destination`, so this cleanly lets it pass straight through, uncached.
  const CACHEABLE_CROSS = new Set(["image", "font", "style", "script"]);
  if (url.origin !== self.location.origin && !CACHEABLE_CROSS.has(request.destination)) {
    return; // network-only; no service-worker caching for live data
  }

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

  // Same-origin app code (scripts + styles): stale-while-revalidate. Serve the
  // cached copy instantly (fast, offline-capable) AND fetch a fresh copy in the
  // background so a new deploy lands on the very next load - even if VERSION
  // wasn't bumped. This is what keeps the installed PWA from silently drifting
  // behind the web version (the cache-first-only shell used to freeze app.js /
  // style.css until VERSION changed, so a missed bump left the PWA stale). Only
  // real successes (response.ok) overwrite the cache, so a blip/404 never sticks.
  // The revalidation uses cache:"no-cache" so it always checks the server (a
  // conditional request: 304 when unchanged, 200 with new bytes when changed) -
  // otherwise the browser's HTTP cache would hand back a stale copy within its
  // max-age (GitHub Pages defaults to ~10 min) and we'd just re-cache stale.
  if (request.destination === "script" || request.destination === "style") {
    const fresh = fetch(request, { cache: "no-cache" })
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(VERSION);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);
    event.waitUntil(fresh); // keep the worker alive for the background refresh
    event.respondWith(
      caches.match(request).then((cached) => cached || fresh.then((r) => r || Response.error()))
    );
    return;
  }

  // Other same-origin assets (local sprites, icons, manifest): cache first, fill
  // from network on miss. These are effectively immutable per deploy, so there's
  // no benefit to revalidating them every load. Only real successes (response.ok)
  // are cached, so a 404 never sticks - the next load retries it (e.g. an icon
  // that wasn't deployed yet).
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
