import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const tauriHost = process.env.TAURI_DEV_HOST;

export default defineConfig({
  build: {
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
    target: "es2020",
  },
  clearScreen: false,
  envDir: "../../",
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  plugins: [react()],
  server: {
    ...(tauriHost
      ? {
          hmr: {
            host: tauriHost,
            port: 1421,
            protocol: "ws" as const,
          },
        }
      : {}),
    host: tauriHost ?? "127.0.0.1",
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  test: {
    css: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
