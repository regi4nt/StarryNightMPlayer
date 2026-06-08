import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // load semua env var (tanpa filter prefix)
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // manifest: false — the static public/manifest.webmanifest is the single source of
      // truth. VitePWA would generate dist/manifest.webmanifest, but Vite's public/ copy
      // runs AFTER plugin output and overwrites it — the generated manifest is silently
      // discarded. Setting manifest: false avoids the dual-manifest race entirely.
      manifest: false,
      // sw.js dulu ada di public/ dan menimpa output Workbox saat build.
      // File itu sudah dihapus — Workbox kini bebas generate sw.js + workbox-*.js di dist/.
      devOptions: {
        enabled: true,       // aktifkan SW di dev mode (pakai Workbox, bukan fallback manual)
        type: 'module',
      },
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // ── Audio files — CacheFirst (30 hari, support range request untuk seek)
          {
            urlPattern: /\.(mp3|wav|ogg|flac|m4a)(\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            }
          },
          // ── Cover art & thumbnails — CacheFirst (tidak pernah berubah untuk URL yang sama)
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cover-art-cache',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'yt-thumb-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // ── Placeholder cover (ui-avatars) — CacheFirst (URL deterministik, tidak berubah)
          {
            urlPattern: /^https:\/\/ui-avatars\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'avatar-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // ── Lirik LRCLib — StaleWhileRevalidate (lirik jarang berubah, tapi tetap fresh)
          {
            urlPattern: /^https:\/\/lrclib\.net\/api\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lyrics-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // ── Radio Browser server list — CacheFirst (berubah sangat jarang, 1 jam TTL)
          {
            urlPattern: /^https:\/\/all\.api\.radio-browser\.info\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'radio-server-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // ── Radio Browser search/list — NetworkFirst (konten sering update, fallback cache)
          {
            urlPattern: /^https:\/\/[a-z0-9]+\.api\.radio-browser\.info\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'radio-data-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 6 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // ── Internal API routes — NetworkFirst (data fresh, tapi fallback ke cache saat offline)
          {
            urlPattern: /^\/api\/(youtube|jamendo|radio|radio-garden|ai|yt-status|ccmixter)(\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 2 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // ── YouTube search via googleapis (saat pakai user key) — NetworkFirst
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/youtube\/v3\/(search|videos)\?/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'yt-api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 2 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
        ]
      }
    })
  ],
  // ── Dev server: paksa browser fetch sw.js dari jaringan (tidak dari disk cache) ──
  // Ini melengkapi updateViaCache:'none' di sisi registrasi JS.
  // Header ini hanya aktif di `vite dev`; untuk production diatur di vercel.json.
  server: {
    headers: {
      // Service Worker & Workbox runtime — TIDAK boleh di-cache oleh browser
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    // Override header khusus untuk sw.js saja (middleware kustom di bawah)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2, drop_console: false },
      mangle: true,
    },
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // ── Manual chunks: pisahkan vendor & fitur besar ──────────
        manualChunks(id) {
          // Vendor: React core + lucide-react digabung agar icon selalu tersedia
          // sebelum App.jsx dieksekusi (mencegah ReferenceError: Music is not defined)
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/lucide-react')
          ) {
            return 'vendor-react';
          }
          // Translations (statis, dimuat awal)
          if (id.includes('src/translations')) {
            return 'translations';
          }
          // Constants & utils (data besar, dimuat awal)
          if (id.includes('src/constants')) {
            return 'app-constants';
          }
          // Radio station data — only needed when Stream tab opens
          if (id.includes('src/radioStations')) {
            return 'radio-data';
          }
          // Lazy components → Rollup otomatis buat chunk terpisah karena dynamic import
          // (SettingsPanel, PlaylistViews, UploadModal sudah jadi chunk sendiri)
        },
      }
    },
    assetsInlineLimit: 4096,
  },
  define: {
    // Expose env vars tanpa VITE_ prefix ke client-side via import.meta.env
    'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID || ''),
    // Versi build unik untuk deteksi SW stale di index.html (auto-unregister)
    // Berubah setiap build sehingga SW lama bisa terdeteksi & di-reset.
    '__SW_BUILD_VERSION__': JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA
        ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 8)   // Vercel: pakai commit SHA pendek
        : Date.now().toString(36)                           // lokal: timestamp base-36
    ),
  },
  }
})
