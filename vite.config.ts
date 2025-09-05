// vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const isCI = process.env.CI === "true";
const hasSentry =
  !!process.env.SENTRY_AUTH_TOKEN &&
  !!process.env.SENTRY_ORG &&
  !!process.env.SENTRY_PROJECT;
const enableSentry = isCI && hasSentry;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    enableSentry &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
        release: {
          name:
            process.env.SENTRY_RELEASE ||
            process.env.GITHUB_SHA ||
            process.env.VERCEL_GIT_COMMIT_SHA ||
            "dev",
          setCommits: { auto: true },
        },
        sourcemaps: {
          assets: "./dist/**",
        },
      }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Node.js polyfills for browser compatibility
      stream: "stream-browserify",
      events: "events",
      util: "util",
      buffer: "buffer",
    },
  },

  define: {
    global: "globalThis",
  },

  build: {
    // Only generate sourcemaps if we'll upload them
    sourcemap: enableSentry,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      external: (id) => {
        // Don't externalize these modules, let them be bundled with polyfills
        if (
          id === "stream" ||
          id === "events" ||
          id === "util" ||
          id === "buffer"
        ) {
          return false;
        }
        return false;
      },
      output: {
        // Replace splitVendorChunkPlugin with manualChunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router")) return "router";
            if (id.includes("@sentry")) return "sentry";
            if (id.includes("katex")) return "katex";
            if (id.includes("monaco-editor")) return "monaco";
            if (id.includes("prismjs")) return "prism";
            if (id.match(/d3|three/)) return "viz";
            if (
              id.includes("stream-browserify") ||
              id.includes("events") ||
              id.includes("util") ||
              id.includes("buffer")
            )
              return "polyfills";
            return "vendor";
          }
        },
      },
    },
    // Image optimization
    assetsInlineLimit: 4096, // inline assets < 4kb
    cssCodeSplit: true,
    target: "esnext",
    minify: "esbuild",
  },

  // Performance optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "stream-browserify",
      "events",
      "util",
      "buffer",
    ],
    exclude: ["@sentry/vite-plugin"],
  },

  // Development server settings
  server: {
    preTransformRequests: false,
  },
});
