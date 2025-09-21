/**
 * Mobile Service Worker Cleanup Utility
 *
 * Handles cleanup of service workers and caches on mobile devices
 * to prevent PWA-related issues and ensure clean state.
 */

/**
 * Enhanced mobile detection with refined logic
 * Reduces false positives by combining multiple detection methods
 */
export const detectMobile = (): boolean => {
  // Primary check: touch capabilities and screen size
  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  // Secondary check: user agent (less reliable but useful for edge cases)
  const mobileUserAgent =
    /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Tablet specific detection
  const isTablet = /iPad|Tablet/i.test(navigator.userAgent);

  // Combine checks with priority to touch + small screen
  return (
    (hasTouchScreen && isSmallScreen) ||
    (mobileUserAgent && isSmallScreen) ||
    isTablet
  );
};

/**
 * Cleanup all service worker registrations
 */
const unregisterServiceWorkers = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => {
        console.log("Unregistering service worker:", registration.scope);
        return registration.unregister();
      })
    );
    console.log(`✅ Unregistered ${registrations.length} service worker(s)`);
  } catch (error) {
    console.error("Failed to unregister service workers:", error);
    throw error;
  }
};

/**
 * Clear all browser caches
 */
const clearAllCaches = async (): Promise<void> => {
  if (!("caches" in window)) return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        console.log("Deleting cache:", cacheName);
        return caches.delete(cacheName);
      })
    );
    console.log(`✅ Cleared ${cacheNames.length} cache(s)`);
  } catch (error) {
    console.error("Failed to clear caches:", error);
    throw error;
  }
};

/**
 * Main cleanup function for mobile service workers
 * Performs complete cleanup and handles reload logic
 */
export const cleanupMobileServiceWorkers = async (): Promise<void> => {
  const isMobile = detectMobile();

  if (!isMobile) {
    console.log("🖥️  Desktop device detected - skipping mobile cleanup");
    return;
  }

  console.log("📱 Mobile device detected - performing service worker cleanup");

  try {
    // Check if we've already performed cleanup to prevent infinite reloads
    const hasReloaded = sessionStorage.getItem("mobile-sw-cleaned");

    if (hasReloaded) {
      console.log("✅ Mobile cleanup already completed this session");
      return;
    }

    // Perform the cleanup
    await Promise.all([unregisterServiceWorkers(), clearAllCaches()]);

    // Mark as cleaned and reload once for clean state
    sessionStorage.setItem("mobile-sw-cleaned", "true");
    console.log("🔄 Reloading for clean mobile state");
    window.location.reload();
  } catch (error) {
    console.error("❌ Mobile cleanup failed:", error);
    // Don't throw here - allow app to continue even if cleanup fails
  }
};

/**
 * Initialize mobile cleanup - should be called before other app initialization
 */
export const initializeMobileCleanup = async (): Promise<void> => {
  await cleanupMobileServiceWorkers();
};
