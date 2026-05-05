import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Build as a self-contained IIFE for embed
    lib: {
      entry: "src/main.tsx",
      name: "HelpdeskAI",
      fileName: "widget",
      formats: ["iife"],
    },
    rollupOptions: {
      // Bundle React into the widget (no external deps needed)
      external: [],
    },
  },
  // Dev server for testing
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  define: {
    "process.env": {},
  },
});
