/**
 * GitHub Pages SPA Routing Utility
 *
 * Handles client-side routing for GitHub Pages deployment
 * where the server can't handle SPA routes directly.
 */

/**
 * Handle GitHub Pages SPA routing redirect
 * This restores the correct route after a page refresh on GitHub Pages
 */
export const handleGitHubPagesRouting = (): void => {
  try {
    const redirectPath = sessionStorage.getItem("ALGO_REDIRECT_PATH");

    if (!redirectPath || redirectPath === "/") {
      return;
    }

    // Clean up the redirect path from session storage
    sessionStorage.removeItem("ALGO_REDIRECT_PATH");

    // Use history.replaceState to avoid adding to browser history
    window.history.replaceState(null, "", redirectPath);

    console.log("✅ Restored GitHub Pages redirect path:", redirectPath);
  } catch (error) {
    console.warn("Failed to handle GitHub Pages redirect:", error);

    // TODO: Report to monitoring service when available
    // logger.warn(LogCategory.ROUTER, "Failed to handle GitHub Pages redirect", {
    //   error: error instanceof Error ? error.message : String(error),
    // });
  }
};

/**
 * Set up GitHub Pages routing for the current session
 * This should be called during app initialization
 */
export const initializeGitHubPagesRouting = (): void => {
  handleGitHubPagesRouting();
};
