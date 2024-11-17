import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: mode === 'development' ? {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  } : undefined,
  resolve: {
    alias: {
      'buffer': 'buffer/'
    }
  },
  optimizeDeps: {
    include: ['buffer']
  }
}))
