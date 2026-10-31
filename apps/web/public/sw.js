// The offline worker of Maestro Calc (site-pwa). A calculator page registers it and hands it itself
// and its files to keep (apps/web/src/client/offline.ts), so a calculator used once with signal
// opens again on a lot without it. Pages: network first, the kept copy when the network fails.
// Hashed files under /_astro/ never change under one name: cache first. Nothing else is touched.
const CACHE = 'maestro-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

// A page is kept under its path, so every query of one calculator shares one copy.
const keep = (url, response) =>
  response.ok
    ? caches
        .open(CACHE)
        .then((cache) => cache.put(url.pathname, response.clone()))
        .then(() => response)
    : response;

const kept = (request) =>
  caches.open(CACHE).then((cache) => cache.match(request, { ignoreSearch: true }));

// A calculator page hands over itself and its hashed files once it runs (offline.ts): they were
// fetched before this worker existed. Only same-origin URLs are kept; one that fails is skipped.
self.addEventListener('message', (event) => {
  const keep = event.data && event.data.keep;
  if (!Array.isArray(keep)) return;
  const own = keep.filter(
    (url) =>
      typeof url === 'string' && new URL(url, self.location.origin).origin === self.location.origin,
  );
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.all(own.map((url) => cache.add(url).catch(() => undefined)))),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(
      kept(request).then((hit) => hit ?? fetch(request).then((response) => keep(url, response))),
    );
  } else if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => keep(url, response))
        .catch(() => kept(request).then((hit) => hit ?? Response.error())),
    );
  }
});
