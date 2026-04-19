/* ============================================================
   SERVICE WORKER — Yellina Seeds Operations Platform
   Offline-first: cache static assets, queue writes when offline
   ============================================================ */
'use strict';

const CACHE_VERSION = 'v116';
const CACHE_NAME = `yellina-seeds-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/variables.css',
  '/css/layout.css',
  '/css/components.css',
  '/js/clock.js',
  '/js/crypto.js',
  '/js/error-boundary.js',
  '/js/offline-queue.js',
  '/js/i18n.js',
  '/js/receipt.js',
  '/js/selects.js',
  '/js/binTile.js',
  '/js/db.js',
  '/js/render.js',
  '/js/config.js',
  '/js/state.js',
  '/js/utils.js',
  '/js/actions.js',
  '/js/cmdPalette.js',
  '/js/roles.js',
  '/js/notifications.js',
  '/js/init.js',
  '/assets/logo.jpg',
  '/assets/wallpaper.jpg',
  '/assets/wallpaper3.jpg',
];

// ── Install: pre-cache all static assets ──
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(e => console.warn('SW cache miss:', url, e))
        )
      );
    })
  );
});

// ── Activate: purge old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // ── Supabase API: network-first, cache response ──
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // ── CDN resources (fonts, supabase-js, xlsx): cache-first ──
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('jsdelivr.net') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('sheetjs.com')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // ── App shell (HTML, CSS, JS, images): cache-first ──
  // ignoreSearch:true lets versioned URLs (?v=N) match unversioned cache entries
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// ── Message: force update ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Notification click: focus or open the app ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
