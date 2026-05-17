import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Starry Night MPlayer',
        short_name: 'StarryMPlayer',
        description: 'Pemutar musik bertema luar angkasa dengan AI, Drive, & EQ',
        theme_color: '#07071a',
        background_color: '#07071a',
        display: 'standalone',
        orientation: 'portrait',
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
        runtimeCaching: [
          {
            // Lagu builtin (SoundHelix, Bensound, dll) — cache setelah pertama diputar
            urlPattern: /\.(mp3|wav|ogg|flac|m4a)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cover art Unsplash
            urlPattern: /^https:\/\/images\.unsplash\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cover-art-cache',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // YouTube thumbnails
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Force ALL code into a single bundle — eliminates all cross-chunk
        // TDZ issues once and for all. The app is small enough (~270KB gz)
        // that a single chunk is perfectly fine for a PWA.
        inlineDynamicImports: true,
      }
    }
  }
})
