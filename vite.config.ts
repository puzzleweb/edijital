import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/isyerimpos/test': {
        target: 'https://apitest.isyerimpos.com/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/isyerimpos\/test/, ''),
      },
      '/api/isyerimpos/prod': {
        target: 'https://api.isyerimpos.com/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/isyerimpos\/prod/, ''),
      },
    },
  },
})

