import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi agar Vite bisa membaca file .jsx langsung di root folder
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // Memastikan Vite mencari file entry point dengan benar
  build: {
    outDir: 'dist',
  }
})
