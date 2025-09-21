// vite.config.ts
// import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// const isCI = process.env.CI === "true";
// const hasSentry =
//   !!process.env.SENTRY_AUTH_TOKEN &&
//   !!process.env.SENTRY_ORG &&
//   !!process.env.SENTRY_PROJECT;
// const enableSentry = isCI && hasSentry;

// GitHub Pages configuration
const isGitHubPages =
  process.env.GITHUB_PAGES === "true" || process.env.GITHUB_ACTIONS === "true";
const repoName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] || "algolens-private";
const baseUrl = isGitHubPages ? `/${repoName}/` : "/";

export default defineConfig({
  base: baseUrl,
  plugins: [
    react(),
    tailwindcss(),
    // enableSentry &&
    //   sentryVitePlugin({
    //     org: process.env.SENTRY_ORG,
    //     project: process.env.SENTRY_PROJECT,
    //     authToken: process.env.SENTRY_AUTH_TOKEN,
    //     telemetry: false,
    //     release: {
    //       name:
    //         process.env.SENTRY_RELEASE ||
    //         process.env.GITHUB_SHA ||
    //         process.env.VERCEL_GIT_COMMIT_SHA ||
    //         "dev",
    //       setCommits: { auto: true },
    //     },
    //     sourcemaps: {
    //       assets: "./dist/**",
    //     },
    //   }),
    // Bundle analyzer - only generate in CI or when ANALYZE=true
    (process.env.CI === "true" || process.env.ANALYZE === "true") &&
      visualizer({
        filename: "dist/bundle-analysis.html",
        open: !process.env.CI,
        gzipSize: true,
        brotliSize: true,
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
    // sourcemap: enableSentry,
    sourcemap: false,
    // Increased limit to accommodate our consolidated bundle strategy
    // This prevents warnings for our intentionally large vendor bundle
    chunkSizeWarningLimit: 2000,
    // Enable compression at build time
    minify: "esbuild",
    target: ["es2020", "chrome80", "safari14", "firefox78", "edge88"],
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
            // Bundle React, polyfills, and everything else together to avoid dependency issues
            return "vendor";
          }
        },
        // Ensure proper module initialization order
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        // Enable compression for assets
        experimentalMinChunkSize: 20000,
      },
    },
    // Image optimization
    assetsInlineLimit: 4096, // inline assets < 4kb
    cssCodeSplit: true,
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
    exclude: [
      // "@sentry/vite-plugin" // Commented out Sentry plugin
    ],
    // Force dependency pre-bundling to avoid temporal dead zone issues
    force: true,
  },

  // Development server settings
  server: {
    preTransformRequests: false,
  },
});
