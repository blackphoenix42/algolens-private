/**
 * AlgoLens Application Entry Point
 *
 * Handles environment validation, root rendering, and bootstrap of
 * mobile/service-worker cleanup, GitHub Pages routing, and resource
 * preloading before mounting the React tree.
 */

// Validate environment variables first
import "./config/env";
// Initialize axe for accessibility testing in development
import "./config/axe";
// Import global styles
import "@/styles/globals.css";

import React from "react";
import ReactDOM from "react-dom/client";

import AppRouter from "@/app/router";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppErrorBoundary } from "@/utils/ErrorBoundary";
import { initializeGitHubPagesRouting } from "@/utils/gitHubPagesRouting";
import { initializeMobileCleanup } from "@/utils/mobileServiceWorkerCleanup";
import { preloadCriticalResources } from "@/utils/resourcePreloader";

async function initializeApp(): Promise<void> {
  try {
    await initializeMobileCleanup();
    initializeGitHubPagesRouting();
    await preloadCriticalResources();
  } catch (error) {
    // Surface init failures but continue to render — the app is usable
    // without preloading or the service-worker cleanup.
    console.error("Application initialization failed:", error);
  }
}

void initializeApp();

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
