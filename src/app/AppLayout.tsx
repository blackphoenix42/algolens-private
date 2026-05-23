// src/app/AppLayout.tsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { KeyboardProvider } from "@/providers/KeyboardProvider";
import { PerformanceProvider } from "@/providers/PerformanceProvider";

/**
 * Layout component that provides router-dependent context providers
 * and installs global error / unhandled-rejection listeners.
 */
export function AppLayout({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <PerformanceProvider>
      <KeyboardProvider>{children || <Outlet />}</KeyboardProvider>
    </PerformanceProvider>
  );
}
