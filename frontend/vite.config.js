import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tailwindPostcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Flatten icons and small utilities into the main vendor chunk to avoid deep chains
          if (
            id.includes("lucide-react") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge")
          ) {
            return "shared-ui-utils";
          }
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router-dom")
          ) {
            return "react-vendor";
          }
          if (id.includes("@clerk")) {
            return "auth-vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  // Force Vite to use local PostCSS plugins and ignore any parent/global config
  css: {
    postcss: {
      plugins: [tailwindPostcss(), autoprefixer()],
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000", // backend port
    },
  },
});
