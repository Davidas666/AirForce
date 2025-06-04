import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // svarbu deploy'ui į šaknį
  plugins: [react(), tailwindcss()],
    server: {
    proxy: {
      '/api': 'http://localhost:3005'
    }
  }
})
