// src/services/monitoring/sentry.client.config.tsx
import * as Sentry from "@sentry/react";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

/**
 * Call initSentry() once, as early as possible in app startup (e.g., in main.tsx).
 * Env vars:
 *  - VITE_SENTRY_DSN: Sentry DSN
 *  - VITE_APP_VERSION: app version for release tagging (optional)
 *  - import.meta.env.MODE used as environment ("development"/"production")
 */
let _sentryInitialized = false;

interface ViteEnvLike {
  MODE?: string;
  VITE_SENTRY_DSN?: string;
  VITE_APP_VERSION?: string;
  [k: string]: unknown;
}

export function initSentry(): boolean {
  const env = (import.meta as unknown as { env?: ViteEnvLike }).env;
  if (!env) return false;
  if (env.MODE === "development") return false;
  const dsn = env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return false;
  if (_sentryInitialized) return true;
  try {
    const integrations: Array<unknown> = [];
    const sentryObj = Sentry as unknown as {
      reactRouterV6BrowserTracingIntegration?: (
        cfg: Record<string, unknown>
      ) => unknown;
      replayIntegration?: (cfg: Record<string, unknown>) => unknown;
    };
    const hasRouterV6 =
      typeof sentryObj.reactRouterV6BrowserTracingIntegration === "function";
    if (hasRouterV6) {
      integrations.push(
        sentryObj.reactRouterV6BrowserTracingIntegration!({
          useEffect: React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        })
      );
    }
    if (typeof sentryObj.replayIntegration === "function") {
      integrations.push(
        sentryObj.replayIntegration!({
          maskAllInputs: true,
          blockAllMedia: true,
        })
      );
    }
    Sentry.init({
      dsn,
      release: (env.VITE_APP_VERSION as string | undefined) ?? undefined,
      environment: env.MODE,
      integrations: integrations as never,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    _sentryInitialized = true;
    return true;
  } catch (err) {
    console.warn("Sentry initialization failed:", err);
    return false;
  }
}

export function isSentryActive() {
  return _sentryInitialized;
}

interface MaybeBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactElement | null;
}

export const MaybeSentryErrorBoundary: React.FC<MaybeBoundaryProps> = ({
  children,
  fallback,
}) => {
  if (!_sentryInitialized) return <>{children}</>;
  return (
    <Sentry.ErrorBoundary
      fallback={fallback ?? <div>Something went wrong.</div>}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};
