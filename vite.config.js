import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
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
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
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
          // Lazy components → Rollup otomatis buat chunk terpisah karena dynamic import
          // (SettingsPanel, PlaylistViews, UploadModal sudah jadi chunk sendiri)
        },
      }
    },
    assetsInlineLimit: 4096,
  }
})
