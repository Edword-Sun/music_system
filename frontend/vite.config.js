import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5101,
    allowedHosts: ['5752bbd.r40.cpolar.top'],
    proxy: {
      '/music': 'http://localhost:8080',
      '/mh': 'http://localhost:8080',
      '/streamer': 'http://localhost:8080',
      '/group': 'http://localhost:8080',
      '/health': 'http://localhost:8080',

      // 没用到的接口
      '/user': 'http://localhost:8080',
      '/uap': 'http://localhost:8080',
      '/comment': 'http://localhost:8080',
    }
  }
})
