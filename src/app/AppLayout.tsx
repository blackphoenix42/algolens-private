// src/app/AppLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";

import { KeyboardProvider } from "@/providers/KeyboardProvider";
import { PerformanceProvider } from "@/providers/PerformanceProvider";

/**
 * Layout component that provides router-dependent context providers
 * This component is rendered within the router context
 */
export function AppLayout({ children }: { children?: React.ReactNode }) {
  return (
    <PerformanceProvider>
      <KeyboardProvider>{children || <Outlet />}</KeyboardProvider>
    </PerformanceProvider>
  );
}
