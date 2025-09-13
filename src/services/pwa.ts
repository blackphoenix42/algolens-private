/**
 * Advanced PWA features for AlgoLens
 * Enhanced service worker integration with offline algorithm caching
 */

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

  constructor() {
    this.setupOnlineListeners();
  }

  // Initialize PWA features
  async initialize(): Promise<boolean> {
    try {
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
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyOnlineCallbacks(true);
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyOnlineCallbacks(false);
    });
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
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [canInstall, setCanInstall] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // Initialize PWA
    pwaManager.initialize();

    // Setup connection listener
    const cleanup = pwaManager.onConnectionChange(setIsOnline);

    // Check install status
    setCanInstall(pwaManager.canInstall());

    // Check if app is installed
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
  }, [pwaManager]);

  const cacheAlgorithm = async (algorithm: OfflineAlgorithm) => {
    return pwaManager.cacheAlgorithm(algorithm);
  };

  const getCachedAlgorithm = async (id: string) => {
    return pwaManager.getCachedAlgorithm(id);
  };

  const getAllCachedAlgorithms = async () => {
    return pwaManager.getAllCachedAlgorithms();
  };

  const showInstallPrompt = async () => {
    const result = await pwaManager.showInstallPrompt();
    if (result) {
      setCanInstall(false);
      setIsInstalled(true);
    }
    return result;
  };

  const getCacheStats = async () => {
    return pwaManager.getCacheStats();
  };

  const clearExpiredCache = async () => {
    return pwaManager.clearExpiredCache();
  };

  const getConnectionInfo = () => {
    return pwaManager.getConnectionInfo();
  };

  const syncWhenOnline = async () => {
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

// Import React for the hook
import React from "react";

export { PWAManager };
export type { CacheConfig, OfflineAlgorithm };
