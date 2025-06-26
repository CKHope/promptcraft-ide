
const CACHE_NAME = 'promptcraft-ide-cache-v1';
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/index.tsx', // Core application script
  // PWA Icons from manifest.json
  '/icons/icon-48x48.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Tailwind is loaded via CDN so not cached here directly, browser caches it.
];

// On install, cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache App Shell:', error);
      })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// On fetch, serve from cache (stale-while-revalidate for app shell) or network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For navigation requests, use Cache-First then Stale-While-Revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Cache hit - return response
          if (cachedResponse) {
            // Simultaneously, fetch a fresh version from network
            const fetchPromise = fetch(request).then(networkResponse => {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
              return networkResponse;
            }).catch(() => {
              // Network failed, do nothing, already served from cache
            });
            return cachedResponse;
          }
          // Not in cache, fetch from network
          return fetch(request)
            .then(networkResponse => {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
              return networkResponse;
            })
            .catch(() => {
              // Network request failed (e.g., offline)
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // For other requests (API calls, assets not in APP_SHELL_FILES), try Network-First then Cache
  // This example focuses on App Shell, API caching strategy (Network-First) is more complex.
  // The BRD states Network-First for API calls which means fetch, then cache if successful.
  // If API call fails, app logic handles it via IndexedDB.
  // For simplicity, non-navigation requests go to network, with generic offline fallback.
  event.respondWith(
    fetch(request).catch(() => {
        // Generic fallback for non-navigation requests if needed, or let app handle.
        // For API calls, we want the app's offline logic (IndexedDB) to kick in,
        // so not returning offline.html for API calls.
        // This could be more specific based on request type.
        if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style' || request.destination === 'image') { // Added 'image' for icons
            return caches.match(request).then(response => response || caches.match('/offline.html'));
        }
        // For other types (e.g. API calls), let the fetch error propagate to the app
    })
  );
});