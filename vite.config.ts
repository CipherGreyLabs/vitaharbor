import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/web",
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          react: ["react", "react-dom", "react-router-dom"],
          icons: ["lucide-react"]
        }
      }
    }
  },
  test: { environment: "jsdom", globals: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
});
