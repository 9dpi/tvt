/**
 * TVT Service Worker — Offline-first caching
 * GitHub Pages compatible
 */

const CACHE_NAME = 'tvt-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/tvt.css',
  './js/models.js',
  './js/ai-providers.js',
  './js/tvt-core.js',
  './js/app.js',
  './manifest.json'
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for AI APIs
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // AI API calls: always network (never cache)
  if (url.hostname.includes('googleapis') ||
      url.hostname.includes('groq.com') ||
      url.hostname.includes('openrouter.ai') ||
      url.hostname === 'localhost') {
    return; // Let browser handle normally
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
