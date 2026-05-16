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
        // Cache shell app & static assets; audio di-stream langsung (no cache)
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Jangan cache audio — biarkan browser stream langsung
            urlPattern: /\.(mp3|wav|ogg|flac|m4a)$/i,
            handler: 'NetworkOnly'
          },
          {
            // Cache cover art (Unsplash) max 50 gambar, 7 hari
            urlPattern: /^https:\/\/images\.unsplash\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cover-art-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  }
})
