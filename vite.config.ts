import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs separately (npm run dev:server) on port 3001.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: false } } },
});
