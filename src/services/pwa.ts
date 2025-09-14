/**
 * Advanced PWA features for AlgoLens
 * Enhanced service worker integration with offline algorithm caching
 */

import React from "react";

interface CacheConfig {
  algorithmCache: string;
  staticCache: string;
  runtimeCache: string;
  maxEntries: number;
  maxAgeSeconds: number;
}

interface OfflineAlgorithm {
  id: string;
  name: string;
  category: string;
  implementation: string;
  examples: unknown[];
  documentation: string;
  cachedAt: number;
}

// TypeScript interfaces for PWA APIs
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

class PWAManager {
  private static readonly CACHE_CONFIG: CacheConfig = {
    algorithmCache: "algolens-algorithms-v1",
    staticCache: "algolens-static-v1",
    runtimeCache: "algolens-runtime-v1",
    maxEntries: 50,
    maxAgeSeconds: 86400 * 7, // 7 days
  };

  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private onlineCallbacks: ((online: boolean) => void)[] = [];
  private isMobile = this.detectMobileDevice();

  // Enhanced mobile device detection
  private detectMobileDevice(): boolean {
    return (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
        navigator.userAgent
      ) ||
      /Mobi|Android/i.test(navigator.userAgent) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768
    );
  }

  constructor() {
    // Only setup online listeners on desktop
    if (!this.isMobile) {
      this.setupOnlineListeners();
    } else {
      // For mobile, always consider online to prevent false offline detection
      this.isOnline = true;
      console.log("Mobile device detected - PWA features disabled");
    }
  }

  // Initialize PWA features
  async initialize(): Promise<boolean> {
    try {
      if (this.isMobile) {
        console.log(
          "Mobile device detected - skipping service worker registration to prevent offline issues"
        );

        // Unregister any existing service workers on mobile
        if ("serviceWorker" in navigator) {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log("Unregistered existing service worker on mobile");
          }

          // Clear all caches on mobile
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
          console.log("Cleared all caches on mobile");
        }

        return false; // Don't initialize PWA on mobile
      }

      if ("serviceWorker" in navigator) {
        this.registration =
          await navigator.serviceWorker.register("/service-worker.js");

        // Handle service worker updates
        this.registration.addEventListener("updatefound", () => {
          this.handleServiceWorkerUpdate();
        });

        console.log("PWA initialized successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("PWA initialization failed:", error);
      return false;
    }
  }

  // Cache algorithms for offline use
  async cacheAlgorithm(algorithm: OfflineAlgorithm): Promise<boolean> {
    try {
      const cache = await caches.open(PWAManager.CACHE_CONFIG.algorithmCache);
      const cacheKey = `/algorithms/${algorithm.id}`;

      const response = new Response(JSON.stringify(algorithm), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${PWAManager.CACHE_CONFIG.maxAgeSeconds}`,
        },
      });

      await cache.put(cacheKey, response);
      console.log(`Algorithm ${algorithm.name} cached for offline use`);
      return true;
    } catch (error) {
      console.error(`Failed to cache algorithm ${algorithm.name}:`, error);
      return false;
    }
  }

  // Get cached algorithm
  async getCachedAlgorithm(
    algorithmId: string
  ): Promise<OfflineAlgorithm | null> {
    try {
      const cache = await caches.open(PWAManager.CACHE_CONFIG.algorithmCache);
      const response = await cache.match(`/algorithms/${algorithmId}`);

      if (response) {
        const algorithm = await response.json();
        return algorithm;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get cached algorithm ${algorithmId}:`, error);
      return null;
    }
  }

  // Get all cached algorithms
  async getAllCachedAlgorithms(): Promise<OfflineAlgorithm[]> {
    try {
      const cache = await caches.open(PWAManager.CACHE_CONFIG.algorithmCache);
      const requests = await cache.keys();
      const algorithms: OfflineAlgorithm[] = [];

      for (const request of requests) {
        if (request.url.includes("/algorithms/")) {
          const response = await cache.match(request);
          if (response) {
            const algorithm = await response.json();
            algorithms.push(algorithm);
          }
        }
      }

      return algorithms.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Failed to get cached algorithms:", error);
      return [];
    }
  }

  // Clear expired cache entries
  async clearExpiredCache(): Promise<void> {
    try {
      const cacheNames = [
        PWAManager.CACHE_CONFIG.algorithmCache,
        PWAManager.CACHE_CONFIG.runtimeCache,
      ];

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        const now = Date.now();

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const cacheControl = response.headers.get("Cache-Control");
            const maxAge = cacheControl?.match(/max-age=(\d+)/)?.[1];

            if (maxAge) {
              const responseTime = new Date(
                response.headers.get("Date") || 0
              ).getTime();
              const expireTime = responseTime + parseInt(maxAge) * 1000;

              if (now > expireTime) {
                await cache.delete(request);
                console.log(`Expired cache entry removed: ${request.url}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to clear expired cache:", error);
    }
  }

  // Get cache usage statistics
  async getCacheStats() {
    try {
      const stats = {
        totalSize: 0,
        algorithmCount: 0,
        staticCount: 0,
        runtimeCount: 0,
        lastCleanup: null as Date | null,
      };

      // Estimate cache sizes (rough calculation)
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        stats.totalSize = estimate.usage || 0;
      }

      // Count cached algorithms
      const algorithms = await this.getAllCachedAlgorithms();
      stats.algorithmCount = algorithms.length;

      return stats;
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      return null;
    }
  }

  // Install app prompt
  async showInstallPrompt(): Promise<boolean> {
    try {
      const deferredPrompt = window.deferredPrompt;

      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          window.deferredPrompt = undefined;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Install prompt failed:", error);
      return false;
    }
  }

  // Check if app can be installed
  canInstall(): boolean {
    return !!window.deferredPrompt;
  }

  // Handle offline/online status
  private setupOnlineListeners(): void {
    window.addEventListener("online", async () => {
      // Double-check with actual ping before declaring online
      const actuallyOnline = await this.isActuallyOnline();
      if (actuallyOnline) {
        this.isOnline = true;
        this.notifyOnlineCallbacks(true);
      }
    });

    window.addEventListener("offline", async () => {
      // Double-check with actual ping before declaring offline
      const actuallyOnline = await this.isActuallyOnline();
      this.isOnline = actuallyOnline;
      this.notifyOnlineCallbacks(actuallyOnline);
    });
  }

  // Real connectivity check (more reliable than navigator.onLine)
  private async isActuallyOnline(): Promise<boolean> {
    try {
      const response = await fetch("/manifest.json?ts=" + Date.now(), {
        cache: "no-store",
        mode: "cors",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private notifyOnlineCallbacks(online: boolean): void {
    this.onlineCallbacks.forEach((callback) => callback(online));
  }

  onConnectionChange(callback: (online: boolean) => void): () => void {
    this.onlineCallbacks.push(callback);

    // Return cleanup function
    return () => {
      const index = this.onlineCallbacks.indexOf(callback);
      if (index > -1) {
        this.onlineCallbacks.splice(index, 1);
      }
    };
  }

  // Handle service worker updates
  private handleServiceWorkerUpdate(): void {
    if (this.registration?.installing) {
      const newWorker = this.registration.installing;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed") {
          // Show update notification
          this.showUpdateNotification();
        }
      });
    }
  }

  private showUpdateNotification(): void {
    // This would show a user-friendly update notification
    console.log("App update available. Refresh to update.");
  }

  // Get connection info
  getConnectionInfo() {
    const nav = navigator as NavigatorWithConnection;
    return {
      isOnline: this.isOnline,
      connectionType: nav.connection?.effectiveType || "unknown",
      downlink: nav.connection?.downlink || null,
      rtt: nav.connection?.rtt || null,
    };
  }

  // Sync data when online
  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // Sync any pending data
      console.log("Syncing data...");

      // This would implement actual sync logic
      // - Upload any pending user data
      // - Download latest algorithm updates
      // - Sync user preferences
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }
}

// React hook for PWA features
export function usePWA() {
  const [pwaManager] = React.useState(() => new PWAManager());
  const [canInstall, setCanInstall] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  // Enhanced mobile device detection
  const isMobile = React.useMemo(() => {
    return (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
        navigator.userAgent
      ) ||
      /Mobi|Android/i.test(navigator.userAgent) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768
    );
  }, []);

  // For mobile devices, always report as online to prevent offline errors
  const [isOnline, setIsOnline] = React.useState(
    isMobile ? true : navigator.onLine
  );

  React.useEffect(() => {
    // Initialize PWA
    pwaManager.initialize();

    // Only setup connection listener on desktop
    let cleanup = () => {};
    if (!isMobile) {
      cleanup = pwaManager.onConnectionChange(setIsOnline);
    }

    // Check install status (only relevant for desktop)
    if (!isMobile) {
      setCanInstall(pwaManager.canInstall());
      setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

      // Listen for beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        window.deferredPrompt = e as BeforeInstallPromptEvent;
        setCanInstall(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        cleanup();
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }

    return cleanup;
  }, [pwaManager, isMobile]);

  const cacheAlgorithm = async (algorithm: OfflineAlgorithm) => {
    // Skip caching on mobile devices
    if (isMobile) return true;
    return pwaManager.cacheAlgorithm(algorithm);
  };

  const getCachedAlgorithm = async (id: string) => {
    // Skip cache lookup on mobile devices
    if (isMobile) return null;
    return pwaManager.getCachedAlgorithm(id);
  };

  const getAllCachedAlgorithms = async () => {
    // Skip cache lookup on mobile devices
    if (isMobile) return [];
    return pwaManager.getAllCachedAlgorithms();
  };

  const showInstallPrompt = async () => {
    // Skip install prompt on mobile devices
    if (isMobile) return false;
    const result = await pwaManager.showInstallPrompt();
    if (result) {
      setCanInstall(false);
      setIsInstalled(true);
    }
    return result;
  };

  const getCacheStats = async () => {
    // Skip cache stats on mobile devices
    if (isMobile) return null;
    return pwaManager.getCacheStats();
  };

  const clearExpiredCache = async () => {
    // Skip cache operations on mobile devices
    if (isMobile) return;
    return pwaManager.clearExpiredCache();
  };

  const getConnectionInfo = () => {
    // For mobile, always return online status
    if (isMobile) {
      return {
        isOnline: true,
        connectionType: "4g", // Assume good mobile connection
        downlink: null,
        rtt: null,
      };
    }
    return pwaManager.getConnectionInfo();
  };

  const syncWhenOnline = async () => {
    // Skip sync operations on mobile devices
    if (isMobile) return;
    return pwaManager.syncWhenOnline();
  };

  return {
    isOnline,
    canInstall,
    isInstalled,
    cacheAlgorithm,
    getCachedAlgorithm,
    getAllCachedAlgorithms,
    showInstallPrompt,
    getCacheStats,
    clearExpiredCache,
    getConnectionInfo,
    syncWhenOnline,
  };
}

export { PWAManager };
export type { CacheConfig, OfflineAlgorithm };
