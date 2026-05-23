import React, { useEffect } from "react";
import {
  createBrowserRouter,
  isRouteErrorResponse,
  Link,
  RouterProvider,
  useRouteError,
} from "react-router-dom";

import HomePage from "@/pages/HomePage";
import VisualizerPage from "@/pages/VisualizerPage";

import { AppLayout } from "./AppLayout";

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

  console.error(`Route error: ${status} - ${statusText}`, {
    status,
    statusText,
    message: msg,
    error: err,
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
    // Respect Vite base path
    const href = `${import.meta.env.BASE_URL}404.html`;
    window.location.replace(href);
  }, []);
  return null;
}

export const createRouter: typeof createBrowserRouter = createBrowserRouter;

// Configure base path for GitHub Pages — derived from import.meta.env.BASE_URL
// which Vite sets from the `base` config (and so stays in sync with the build).
const getBasename = () => {
  const base = import.meta.env.BASE_URL || "/";
  // BASE_URL has a trailing slash (e.g. "/algolens-private/"); router wants no trailing slash
  return base === "/" ? "/" : base.replace(/\/$/, "");
};

const router = createRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "viz/:topic/:slug",
          element: <VisualizerPage />,
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
  // Listen for SPA navigations so future analytics hooks can attach here.
  useEffect(() => {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const handleLocationChange = () => {
      /* hook point for analytics / page-view tracking */
    };

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
