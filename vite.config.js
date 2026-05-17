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
        // Hanya precache file kecil — jangan precache JS besar agar load awal cepat
        globPatterns: ['**/*.{css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        runtimeCaching: [
          {
            // JS & CSS assets — cache setelah pertama dimuat (hash-based = aman)
            urlPattern: /\/assets\/.+\.(js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Audio files
            urlPattern: /\.(mp3|wav|ogg|flac|m4a)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cover art
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
    // Target browser modern — bundle lebih kecil, tidak perlu polyfill lama
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],
    // Minifikasi maksimal pakai terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // hapus semua console.log di production
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
        passes: 2,               // 2 pass compress untuk hasil lebih kecil
      },
      mangle: { safari10: true },
      format: { comments: false } // hapus semua komentar
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Single bundle — hindari TDZ cross-chunk issues
        inlineDynamicImports: true,
        // Nama file dengan hash untuk cache busting optimal
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    // Inline asset kecil langsung ke JS (kurangi request)
    assetsInlineLimit: 4096,
  }
})
