
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // We'll load the plugin dynamically only in development mode
  const plugins = [react()];
  
  // Only attempt to load componentTagger in development mode
  if (mode === 'development') {
    // We'll import it in a way that works with Vite's plugin system
    try {
      const { componentTagger } = require("lovable-tagger");
      plugins.push(componentTagger());
    } catch (err) {
      console.warn("Could not load lovable-tagger, continuing without it:", err);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins.filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Add this for Netlify builds
    build: {
      rollupOptions: {
        // External dependencies that should not be bundled
        external: ['jspdf']
      },
      // Create redirect file for SPA routing in Netlify
      outDir: 'dist',
    },
  };
});
