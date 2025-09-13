// src/i18n/I18nProvider.tsx
import "./index"; // Initialize i18n

import React, { Suspense } from "react";

import { LanguageProvider } from "./LanguageContext";

interface I18nProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * I18n Provider component that wraps the app with i18n context
 * Uses Suspense to handle the async loading of translations
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  fallback = (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  ),
}) => {
  return (
    <Suspense fallback={fallback}>
      <LanguageProvider>{children}</LanguageProvider>
    </Suspense>
  );
};
