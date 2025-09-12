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
    // Ensure React is properly resolved
    dedupe: ["react", "react-dom"],
  },

  define: {
    global: "globalThis",
  },

  build: {
    // Only generate sourcemaps if we'll upload them
    sourcemap: enableSentry,
    // Increased limit to accommodate our consolidated bundle strategy
    // This prevents warnings for our intentionally large vendor bundle
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // Don't externalize anything - keep everything bundled
      external: () => false,
      output: {
        // Replace splitVendorChunkPlugin with manualChunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Keep only the heaviest libraries separate to avoid TDZ issues
            if (id.includes("katex")) return "katex";
            if (id.includes("monaco-editor")) return "monaco";
            if (id.includes("prismjs")) return "prism";
            if (id.match(/d3|three/)) return "viz";
            // Bundle React, Sentry, polyfills, and everything else together to avoid dependency issues
            return "vendor";
          }
        },
        // Ensure proper module initialization order
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
      },
    },
    // Image optimization
    assetsInlineLimit: 4096, // inline assets < 4kb
    cssCodeSplit: true,
    target: "esnext",
    minify: "esbuild",
    // Help resolve module order issues
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  // Performance optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "react/jsx-runtime",
      "stream-browserify",
      "events",
      "util",
      "buffer",
    ],
    exclude: ["@sentry/vite-plugin"],
    // Force dependency pre-bundling to avoid temporal dead zone issues
    force: true,
  },

  // Development server settings
  server: {
    preTransformRequests: false,
  },
});
