import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@devflow/core": path.resolve(__dirname, "../packages/core/src"),
      "@devflow/navigation": path.resolve(__dirname, "../packages/navigation/src"),
      "@devflow/motion": path.resolve(__dirname, "../packages/motion/src"),
      "@devflow/shell": path.resolve(__dirname, "../packages/shell/src")
    },
    dedupe: ["react", "react-dom"]
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
