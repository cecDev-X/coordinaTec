import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: mode === 'student' || mode === 'admin' ? {
    rollupOptions: { input: mode === 'student' ? 'student.html' : 'admin.html' },
  } : undefined,
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
}))
