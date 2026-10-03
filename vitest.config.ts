import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    // Note: `exclude` replaces Vitest's defaults, so these are all listed.
    // ".kilo" holds a stale untracked worktree copy of this repo whose tests
    // resolve the "@" alias to ./src — i.e. they would run the real source
    // through a duplicate, outdated test file and double-count every suite.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/.kilo/**",
      "**/test-results/**",
    ],
  },
});
