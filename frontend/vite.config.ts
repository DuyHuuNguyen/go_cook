import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/app/' : '/',
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/ws-chat': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: '../src/main/resources/static/app',
    emptyOutDir: true,
  },
}));
