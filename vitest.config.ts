import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    // Create this file if you need RTL/jest-dom, mocks, etc.
    setupFiles: ["src/tests/setup.ts"],
    css: true,
    // Keep E2E & generated outputs out of unit runs
    exclude: [
      "node_modules",
      "dist",
      "e2e",
      "playwright-report",
      "test-results",
      "**/*.e2e.{test,spec}.{ts,tsx,js,jsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["src/test/**", "src/**/*.d.ts", "src/**/__mocks__/**"],
    },
    // Increase if DOM-heavy tests need more time
    testTimeout: 10000,
    // Storybook browser tests require @vitest/browser-playwright;
    // run them separately via `npm run test:storybook` when the package is installed.
    // projects: [
    //   {
    //     extends: true,
    //     plugins: [
    //       storybookTest({
    //         configDir: path.join(dirname, ".storybook"),
    //       }),
    //     ],
    //     test: {
    //       name: "storybook",
    //       browser: {
    //         enabled: true,
    //         headless: true,
    //         provider: "playwright",
    //         instances: [{ browser: "chromium" }],
    //       },
    //       setupFiles: [".storybook/vitest.setup.ts"],
    //     },
    //   },
    // ],
  },
});
