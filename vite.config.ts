
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Only import componentTagger in development
const componentTagger = process.env.NODE_ENV === 'development' 
  ? () => import('lovable-tagger').then(m => m.componentTagger())
  : null;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only apply componentTagger in development mode
    mode === 'development' && componentTagger,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add this for Netlify builds
  build: {
    rollupOptions: {
      // External dependencies that should not be bundled
      external: []
    },
    // Create redirect file for SPA routing in Netlify
    outDir: 'dist',
  },
}));
