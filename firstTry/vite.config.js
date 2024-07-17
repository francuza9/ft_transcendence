// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: './pong/static/src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
