// Starry Night MPlayer — Service Worker
// File ini adalah fallback minimal. Saat `npm run build`, VitePWA/Workbox akan
// overwrite file ini dengan versi Workbox yang lebih lengkap (caching, offline, dll).
// File ini cukup untuk memenuhi syarat PWA installable (standalone, bukan shortcut).

const CACHE = 'starry-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest'];

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

self.addEventListener('fetch', (e) => {
  // Passthrough untuk API calls — jangan cache request ke /api/
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache GET responses sukses untuk aset statis
        if (e.request.method === 'GET' && res.status === 200) {
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
