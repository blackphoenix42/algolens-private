import * as Sentry from "@sentry/react";
import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "react-router-dom";

import { AppLayout } from "./AppLayout";

import HomePage from "@/pages/HomePage";
import VisualizerPage from "@/pages/VisualizerPage";
import { LogCategory, logger } from "@/services/monitoring";

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
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-lg w-full border rounded-xl p-6 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
        <h1 className="text-2xl font-bold mb-2">
          {status} — {statusText}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          {msg || "Something went wrong while rendering this page."}
        </p>
        <div className="flex gap-2">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
          >
            ← Back to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
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

// Log router creation
logger.debug(LogCategory.ROUTER, "Creating application router", {
  sentryIntegration: hasWrap(Sentry),
  routes: [
    { path: "/", component: "HomePage" },
    { path: "/viz/:topic/:slug", component: "VisualizerPage" },
    { path: "*", component: "Static404" },
  ],
});

const router = createRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "viz/:topic/:slug",
        element: <VisualizerPage />,
      },
    ],
  },
  // Catch-all: use the static 404 page
  { path: "*", element: <Static404 /> },
]);

export default function AppRouter() {
  logger.info(LogCategory.ROUTER, "Rendering AppRouter");
  return <RouterProvider router={router} />;
}
