
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Configuramos os plugins
  const plugins = [react()];
  
  // Carregamos o plugin componentTagger apenas em desenvolvimento
  if (mode === 'development') {
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
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Configuração para o Netlify
    build: {
      outDir: 'dist',
    },
    optimizeDeps: {
      // Garantir que jspdf e jspdf-autotable sejam pré-bundled corretamente
      include: ['jspdf', 'jspdf-autotable']
    },
    // Certifique-se que esses módulos são processados corretamente pelo esbuild
    ssr: {
      noExternal: ['jspdf', 'jspdf-autotable']
    }
  };
});
