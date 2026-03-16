import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi khusus agar Vite mengenali app.jsx sebagai entry point utama
export default defineConfig({
  plugins: [react()],
  // Kita definisikan secara manual letak file app.jsx agar Vercel tidak bingung
  resolve: {
    alias: {
      '@': '/app.jsx',
    },
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  }
})
