import * as Sentry from "@sentry/react";
import React, { Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  isRouteErrorResponse,
  Link,
  RouterProvider,
  useRouteError,
} from "react-router-dom";

import { LogCategory, logger, sessionTracker } from "@/services/monitoring";

import { AppLayout } from "./AppLayout";

// Lazy load pages to reduce initial bundle size
const HomePage = React.lazy(() => import("@/pages/HomePage"));
const VisualizerPage = React.lazy(() => import("@/pages/VisualizerPage"));

// Loading component for lazy-loaded routes
const RouteLoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
    </div>
  </div>
);

/** Used ONLY as errorElement (has access to useRouteError) */
function ErrorBoundary() {
  const err = useRouteError();
  const isResp = isRouteErrorResponse(err);
  const status = isResp ? err.status : 500;
  const statusText = isResp ? err.statusText : "Unexpected Error";

  const msg =
    !isResp && err instanceof Error
      ? err.message
      : !isResp &&
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as Record<string, unknown>).message === "string"
        ? (err as { message: string }).message
        : null;

  // Log the routing error
  logger.error(LogCategory.ROUTER, `Route error: ${status} - ${statusText}`, {
    status,
    statusText,
    message: msg,
    error: err,
    url: window.location.href,
  });

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-lg rounded-xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="mb-2 text-2xl font-bold">
          {status} — {statusText}
        </h1>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          {msg || "Something went wrong while rendering this page."}
        </p>
        <div className="flex gap-2">
          <Link
            to="/"
            className="rounded-lg border bg-white px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          >
            ← Back to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border bg-white px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/** Catch-all: load the static 404.html from public/ */
function Static404() {
  useEffect(() => {
    // Log 404 navigation
    logger.warn(LogCategory.ROUTER, "404 route accessed", {
      url: window.location.href,
      path: window.location.pathname,
      search: window.location.search,
    });

    // Respect Vite base path if you ever set one
    const href = `${import.meta.env.BASE_URL}404.html`;

    // Optional breadcrumb in Sentry for "route not found"
    Sentry.addBreadcrumb({
      category: "routing",
      message: "redirecting to /404.html",
      level: "info",
    });
    // Optional signal (non-fatal)
    Sentry.captureMessage("route_not_found");

    logger.info(LogCategory.ROUTER, "Redirecting to static 404 page", { href });

    // Hard navigate to the static file
    window.location.replace(href);
  }, []);
  return null;
}

type WrapFn = (fn: typeof createBrowserRouter) => typeof createBrowserRouter;

// Runtime type guard to check for the wrapper without using `any`
const hasWrap = (o: unknown): o is { wrapCreateBrowserRouterV6: WrapFn } =>
  typeof o === "object" &&
  o !== null &&
  typeof (o as Record<string, unknown>).wrapCreateBrowserRouterV6 ===
    "function";

export const createRouter: typeof createBrowserRouter = hasWrap(Sentry)
  ? Sentry.wrapCreateBrowserRouterV6(createBrowserRouter)
  : createBrowserRouter;

// Configure base path for GitHub Pages
const getBasename = () => {
  // Check if running on GitHub Pages or in CI with GitHub Actions base path
  if (typeof window !== "undefined") {
    const { hostname, pathname } = window.location;

    // Production GitHub Pages
    if (
      hostname === "blackphoenix42.github.io" &&
      pathname.startsWith("/algolens-private")
    ) {
      return "/algolens-private";
    }

    // CI/testing environment with GitHub Actions base path
    if (
      (hostname === "127.0.0.1" || hostname === "localhost") &&
      pathname.startsWith("/algolens-private")
    ) {
      return "/algolens-private";
    }
  }
  return "/";
};

// Log router creation
logger.debug(LogCategory.ROUTER, "Creating application router", {
  sentryIntegration: hasWrap(Sentry),
  routes: [
    { path: "/", component: "HomePage" },
    { path: "/viz/:topic/:slug", component: "VisualizerPage" },
    { path: "*", component: "Static404" },
  ],
});

const router = createRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<RouteLoadingFallback />}>
              <HomePage />
            </Suspense>
          ),
        },
        {
          path: "viz/:topic/:slug",
          element: (
            <Suspense fallback={<RouteLoadingFallback />}>
              <VisualizerPage />
            </Suspense>
          ),
        },
      ],
    },
    // Catch-all: use the static 404 page
    { path: "*", element: <Static404 /> },
  ],
  {
    basename: getBasename(),
  }
);

export default function AppRouter() {
  logger.info(LogCategory.ROUTER, "Rendering AppRouter");

  // Log page views
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      logger.info(LogCategory.ROUTER, "Route changed", {
        path,
        search: window.location.search,
        hash: window.location.hash,
        timestamp: new Date().toISOString(),
      });

      sessionTracker.logPageView(path);
    };

    // Log initial page view
    handleLocationChange();

    // Set up navigation listener
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      setTimeout(handleLocationChange, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      setTimeout(handleLocationChange, 0);
    };

    window.addEventListener("popstate", handleLocationChange);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  return <RouterProvider router={router} />;
}
