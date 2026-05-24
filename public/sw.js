// Starry Night MPlayer — Service Worker (fallback / dev mode)
// Saat `npm run build`, VitePWA/Workbox overwrite file ini dengan versi Workbox lengkap.
// File ini dipakai di dev mode atau sebagai fallback minimal.

const CACHE = 'starry-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Handle SKIP_WAITING pesan dari index.html
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.status === 200) {
          const url = new URL(e.request.url);
          const isStatic = /\.(js|css|png|svg|ico|woff2|webmanifest)$/.test(url.pathname);
          if (isStatic) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
