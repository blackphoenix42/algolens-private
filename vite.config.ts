// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

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
    sourcemap: false,
    // Warn earlier than the default 500KB so we notice regressions; the vendor
    // chunk currently sits around ~1.2MB and we want pressure to keep it bounded.
    chunkSizeWarningLimit: 800,
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
    exclude: [],
    // Force dependency pre-bundling to avoid temporal dead zone issues
    force: true,
  },

  // Development server settings
  server: {
    preTransformRequests: false,
  },
});
