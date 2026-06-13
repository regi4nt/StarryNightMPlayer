import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-debug',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/lucide-react')) {
            return 'vendor-react';
          }
          if (id.includes('src/translations')) {
            return 'translations';
          }
        }
      }
    }
  },
  define: {
    'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(''),
    '__SW_BUILD_VERSION__': JSON.stringify('debug'),
  }
})
