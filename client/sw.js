// sw.js
const CACHE_NAME = 'race-timer-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/index.js',
  '/marshal.js',
  '/racer.js',
];

// Install event: cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

// Fetch event: serve cached files if offline
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle API caching (only GET)
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(request)
          .then(response => {
            cache.put(request, response.clone()); // cache latest
            return response;
          })
          .catch(() => caches.match(request)), // fallback to cache if offline
      ),
    );
    return;
  }

  // Handle static files
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return (
        cachedResponse ||
          fetch(request).catch(() => caches.match('/index.html'))
      );
    }),
  );
});
