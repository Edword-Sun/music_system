import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5101,
    proxy: {
      '/user': 'http://localhost:8080',
      '/music': 'http://localhost:8080',
      '/uap': 'http://localhost:8080',
      '/health': 'http://localhost:8080'
    }
  }
})