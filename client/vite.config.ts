import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@devflow/core": path.resolve(__dirname, "../packages/core/dist/index.js"),
      "@devflow/navigation": path.resolve(
        __dirname,
        "../packages/navigation/dist/index.js"
      ),
      "@devflow/motion": path.resolve(
        __dirname,
        "../packages/motion/dist/index.js"
      ),
      "@devflow/shell": path.resolve(__dirname, "../packages/shell/dist/index.js"),
      "lucide-react": path.resolve(__dirname, "./node_modules/lucide-react"),
      "framer-motion": path.resolve(__dirname, "./node_modules/framer-motion"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react-router-dom": path.resolve(__dirname, "./node_modules/react-router-dom"),
    },
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
