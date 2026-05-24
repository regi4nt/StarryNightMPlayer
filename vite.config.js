import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Starry Night MPlayer',
        short_name: 'StarryMPlayer',
        description: 'Pemutar musik bertema luar angkasa dengan AI, Drive, & EQ',
        theme_color: '#07071a',
        background_color: '#07071a',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'favicon.svg',  sizes: 'any',     type: 'image/svg+xml' }
        ],
        categories: ['music', 'entertainment'],
        shortcuts: [
          { name: 'Player', url: '/?tab=player', description: 'Buka player' },
          { name: 'Stream', url: '/?tab=stream', description: 'Lihat platform streaming' }
        ]
      },
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
