// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import { initAnalytics } from "./services/analytics/analytics";
import { initWebVitals } from "./services/analytics/webVitals";
import "./services/monitoring/sessionTracker"; // Initialize session tracking

import AppRouter from "@/app/router";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { log, logger, LogCategory } from "@/services/monitoring";
import {
  initSentry,
  MaybeSentryErrorBoundary,
} from "@/services/monitoring/sentry.client.config";
import "@/styles/globals.css";

// Remove lazy loading for now to debug the issue

// Enhanced Error Boundary
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
    logger.error(LogCategory.GENERAL, error.message, { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                AlgoLens encountered an unexpected error. Please try refreshing
                the page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload critical fonts
  if (document.fonts) {
    document.fonts.load("400 1em Inter").catch(() => {
      // Silently fail - font loading is not critical
    });
  }

  // Preload critical images
  const criticalImages = ["/brand/AlgoLens.svg"];

  criticalImages.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
};

// Initialize logging first
log.info("🚀 AlgoLens application starting...");

// Preload critical resources for better performance
preloadCriticalResources();

// Initialize monitoring and analytics
logger.time("app-initialization");
log.debug("Initializing Sentry...");
initSentry();

log.debug("Initializing analytics...");
initAnalytics();

log.debug("Initializing web vitals monitoring...");
initWebVitals();

logger.timeEnd("app-initialization");
log.info("Application initialization complete");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <MaybeSentryErrorBoundary
        fallback={<div>Something went wrong with Sentry.</div>}
      >
        <I18nProvider>
          <ThemeProvider>
            <AppRouter />
          </ThemeProvider>
        </I18nProvider>
      </MaybeSentryErrorBoundary>
    </AppErrorBoundary>
  </React.StrictMode>
);
