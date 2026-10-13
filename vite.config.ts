import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      // Proxy API calls during dev so `${window.location.origin}/api` works
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        // Do not rewrite, backend already expects the global prefix 'api'
        // pathRewrite not needed; keep '/api' as-is
      },
    },
  },
})
