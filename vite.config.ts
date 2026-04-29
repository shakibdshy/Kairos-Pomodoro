import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

const host = process.env.TAURI_DEV_HOST;
const e2e = process.env.E2E === "true";

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      ...(e2e
        ? {
            "@tauri-apps/plugin-sql": fileURLToPath(
              new URL("./e2e/mocks/db-mock.ts", import.meta.url),
            ),
            "@tauri-apps/api/core": fileURLToPath(
              new URL("./e2e/mocks/api-mock.ts", import.meta.url),
            ),
            "@tauri-apps/api/event": fileURLToPath(
              new URL("./e2e/mocks/event-mock.ts", import.meta.url),
            ),
            "@tauri-apps/plugin-notification": fileURLToPath(
              new URL(
                "./e2e/mocks/notification-plugin-mock.ts",
                import.meta.url,
              ),
            ),
          }
        : {}),
    },
  },
  define: {
    ...(e2e ? { "window.__TAURI_INTERNALS__": "{}" } : {}),
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
