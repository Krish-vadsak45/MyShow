import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import process from "node:process";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000", // backend port
    },
  },
});
