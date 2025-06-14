import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return
        warn(warning)
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  define: {
    global: "globalThis",
  },
})
