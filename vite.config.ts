
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Don't mark jspdf as external; instead we'll install it properly
    // rollupOptions: {
    //   external: ['jspdf']
    // }
  },
  optimizeDeps: {
    include: ['jspdf']
  }
});
