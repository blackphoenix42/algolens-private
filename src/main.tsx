// src/main.tsx
// Validate environment variables first
import "./config/env";

// CRITICAL: Immediate mobile service worker cleanup before anything else
(async () => {
  // Enhanced mobile detection
  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
      navigator.userAgent
    ) ||
    /Mobi|Android/i.test(navigator.userAgent) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768;

  if (isMobile && "serviceWorker" in navigator) {
    try {
      console.log(
        "🔧 Mobile device detected - cleaning up service workers immediately"
      );

      // Get all registrations and unregister them
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((reg) => {
          console.log("Unregistering service worker:", reg.scope);
          return reg.unregister();
        })
      );

      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          console.log("Deleting cache:", cacheName);
          return caches.delete(cacheName);
        })
      );

      // Force reload once to ensure clean state (prevent infinite reload)
      const hasReloaded = sessionStorage.getItem("mobile-sw-cleaned");
      if (!hasReloaded) {
        sessionStorage.setItem("mobile-sw-cleaned", "true");
        console.log("🔄 Reloading for clean mobile state");
        window.location.reload();
        return;
      }

      console.log("✅ Mobile cleanup complete");
    } catch (error) {
      console.error("Mobile cleanup failed:", error);
    }
  }
})();

// Initialize axe for accessibility testing in development
import "./config/axe";
// import "./services/monitoring/sessionTracker"; // Initialize session tracking
import "@/styles/globals.css";

// Force dark theme immediately
document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme = "dark";

import React from "react";
import ReactDOM from "react-dom/client";

import AppRouter from "@/app/router";
// import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/providers/ThemeProvider";
// import { log, LogCategory, logger } from "@/services/monitoring";
import {
  initSentry,
  MaybeSentryErrorBoundary,
} from "@/services/monitoring/sentry.client.config";

// import { initAnalytics } from "./services/analytics/analytics";
// import { initWebVitals } from "./services/analytics/webVitals";

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
    // logger.error(LogCategory.GENERAL, error.message, { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="mx-4 w-full max-w-md">
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
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
              <h3 className="mb-2 text-center text-lg font-medium text-gray-900 dark:text-white">
                Something went wrong
              </h3>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                AlgoLens encountered an unexpected error. Please try refreshing
                the page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
// log.info("🚀 AlgoLens application starting...");

// Preload critical resources for better performance
preloadCriticalResources();

// Initialize Sentry first (critical for error tracking)
// logger.time("app-initialization");
// log.debug("Initializing Sentry...");
initSentry();

// Defer heavy analytics initialization to reduce main thread blocking
// setTimeout(() => {
//   log.debug("Initializing analytics...");
//   initAnalytics();

//   log.debug("Initializing web vitals monitoring...");
//   initWebVitals();

//   logger.timeEnd("app-initialization");
//   log.info("Background services initialized");
// }, 100);

// Handle GitHub Pages SPA routing
try {
  const redirectPath = sessionStorage.getItem("ALGO_REDIRECT_PATH");
  if (redirectPath && redirectPath !== "/") {
    sessionStorage.removeItem("ALGO_REDIRECT_PATH");
    // Use history.replaceState to avoid adding to history
    window.history.replaceState(null, "", redirectPath);
    // logger.info(LogCategory.ROUTER, "Restored GitHub Pages redirect path", {
    //   path: redirectPath,
    // });
  }
} catch {
  // logger.warn(LogCategory.ROUTER, "Failed to handle GitHub Pages redirect", {
  //   error: error instanceof Error ? error.message : String(error),
  // });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <MaybeSentryErrorBoundary
        fallback={<div>Something went wrong with Sentry.</div>}
      >
        {/* <I18nProvider> */}
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
        {/* </I18nProvider> */}
      </MaybeSentryErrorBoundary>
    </AppErrorBoundary>
  </React.StrictMode>
);
