import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1100,
    // No manualChunks: the three.js ecosystem must stay behind the lazy
    // scene imports (object-form manualChunks hoists it into the entry).
  },
});
