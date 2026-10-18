/* Crypto Terminal service worker.
   Scope is /crypto-terminal/ (GitHub Pages project site).
   The app shell is cached so the UI opens offline.
   Market-data and news requests are network-first, with the last
   successful response used only when the network fails. */

const SCOPE = "/crypto-terminal/";
const CACHE = "crypto-terminal-shell-v1";

const SHELL = [
  "index.html",
  "manifest.webmanifest",
  "favicon-32.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "vendor/lightweight-charts.standalone.production.js",
].map((path) => SCOPE + path);

const API_HOSTS = new Set([
  "data-api.binance.vision",
  "api.binance.com",
  "api.rss2json.com",
  "api.crypto.com",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch (err) {
    return;
  }

  if (API_HOSTS.has(url.hostname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  if (url.pathname === SCOPE + "sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true }), {
      status: 504,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && !fresh.redirected) await cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    return (
      (await cache.match(request)) ||
      (await cache.match(SCOPE + "index.html")) ||
      (await cache.match(SCOPE)) ||
      new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.ok && !fresh.redirected) {
    const cache = await caches.open(CACHE);
    await cache.put(request, fresh.clone());
  }
  return fresh;
}
