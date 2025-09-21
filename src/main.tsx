/**
 * AlgoLens Application Entry Point
 *
 * This is the main entry point for the AlgoLens visualization application.
 * It handles initialization, error boundaries, and rendering of the root component.
 */

// Validate environment variables first
import "./config/env";
// Initialize axe for accessibility testing in development
import "./config/axe";
// Import global styles
import "@/styles/globals.css";

import React from "react";
import ReactDOM from "react-dom/client";

// Import components and providers
import AppRouter from "@/app/router";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppErrorBoundary } from "@/utils/ErrorBoundary";
// Import utilities
import { initializeGitHubPagesRouting } from "@/utils/gitHubPagesRouting";
import { initializeMobileCleanup } from "@/utils/mobileServiceWorkerCleanup";
import { preloadCriticalResources } from "@/utils/resourcePreloader";

// Initialize application
const initializeApp = async (): Promise<void> => {
  console.log("🚀 AlgoLens application starting...");

  try {
    // 1. Handle mobile service worker cleanup first (critical for mobile devices)
    await initializeMobileCleanup();

    // 2. Initialize GitHub Pages routing
    initializeGitHubPagesRouting();

    // 3. Preload critical resources for better performance
    await preloadCriticalResources();

    console.log("✅ Application initialization complete");
  } catch (error) {
    console.error("❌ Application initialization failed:", error);
    // Continue with app rendering even if initialization partially fails
  }
};

// Start initialization
initializeApp();

// Render the application
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);

/**
 * TODO: Future enhancements when ready
 * - Re-enable monitoring and analytics services
 * - Add internationalization support
 * - Implement Sentry error boundary
 *
 * Commented out services for future implementation:
 * - import { I18nProvider } from "@/i18n";
 * - import { initSentry, MaybeSentryErrorBoundary } from "@/services/monitoring/sentry.client.config";
 * - import { initAnalytics } from "./services/analytics/analytics";
 * - import { initWebVitals } from "./services/analytics/webVitals";
 * - import { log, LogCategory, logger } from "@/services/monitoring";
 * - import "./services/monitoring/sessionTracker";
 */
