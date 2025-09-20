// src/app/AppLayout.tsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { KeyboardProvider } from "@/providers/KeyboardProvider";
import { PerformanceProvider } from "@/providers/PerformanceProvider";
// import { LogCategory, logger } from "@/services/monitoring";

/**
 * Layout component that provides router-dependent context providers
 * This component is rendered within the router context
 */
export function AppLayout({ children }: { children?: React.ReactNode }) {
  // Log layout mount
  useEffect(() => {
    // logger.debug(LogCategory.GENERAL, "AppLayout mounted");

    // Log performance and navigation events
    const logPerformance = () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        // logger.info(LogCategory.PERFORMANCE, "Page performance metrics", {
        //   loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        //   domContentLoaded:
        //     navigation.domContentLoadedEventEnd -
        //     navigation.domContentLoadedEventStart,
        //   firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime,
        //   firstContentfulPaint: performance.getEntriesByName(
        //     "first-contentful-paint"
        //   )[0]?.startTime,
        //   timestamp: new Date().toISOString(),
        // });
      }
    };

    // Log initial load performance
    if (document.readyState === "complete") {
      logPerformance();
    } else {
      window.addEventListener("load", logPerformance);
    }

    // Log unhandled errors
    const handleError = (event: ErrorEvent) => {
      // logger.error(LogCategory.GENERAL, "Unhandled JavaScript error", {
      //   message: event.message,
      //   filename: event.filename,
      //   lineno: event.lineno,
      //   colno: event.colno,
      //   error: event.error?.stack,
      //   timestamp: new Date().toISOString(),
      // });
      console.error("Unhandled error:", event);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      // logger.error(LogCategory.GENERAL, "Unhandled promise rejection", {
      //   reason: event.reason,
      //   timestamp: new Date().toISOString(),
      // });
      console.error("Unhandled rejection:", event);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("load", logPerformance);
      // logger.debug(LogCategory.GENERAL, "AppLayout unmounted");
    };
  }, []);

  return (
    <PerformanceProvider>
      <KeyboardProvider>{children || <Outlet />}</KeyboardProvider>
    </PerformanceProvider>
  );
}
