/* service-worker.js
   Scope: "/" (place this file in /public so it's served at /service-worker.js)
   Register from your app (early): navigator.serviceWorker.register("/service-worker.js");
*/

// Immediately exit on mobile devices to prevent any caching issues
const isMobileDevice =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
    navigator.userAgent
  ) ||
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0;

if (isMobileDevice) {
  console.log("Mobile device detected - service worker will not activate");

  // Immediately unregister this service worker on mobile
  self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      self.registration.unregister().then(() => {
        console.log("Service worker unregistered on mobile");
        return self.clients.claim();
      })
    );
  });

  // Don't handle any fetch events on mobile
  self.addEventListener("fetch", () => {
    // Let all requests pass through to the network
    return;
  });
} else {
  // Desktop service worker logic below

  const APP_VERSION = "v1.0.0"; // update on deploys (or replace at build time)
  const PREFIX = "algolens";
  const STATIC_CACHE = `${PREFIX}-static-${APP_VERSION}`;
  const PAGE_CACHE = `${PREFIX}-pages-${APP_VERSION}`;
  const ASSET_CACHE = `${PREFIX}-assets-${APP_VERSION}`;
  const IMAGE_CACHE = `${PREFIX}-images-${APP_VERSION}`;
  const FONT_CACHE = `${PREFIX}-fonts-${APP_VERSION}`;
  const MAX_IMAGE_ENTRIES = 80;
  const MAX_FONT_ENTRIES = 20;

  const OFFLINE_URL = "/offline.html";

  // Minimal precache. (Avoid listing hashed assets; handle those at runtime.)
  const PRECACHE_URLS = [
    "/", // boot route
    "/index.html",
    "/manifest.json",
    OFFLINE_URL,
    "/icons/android-chrome-192x192.png",
    "/icons/android-chrome-512x512.png",
  ];

  // Enable Navigation Preload (if available) for faster navigations
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        if ("navigationPreload" in self.registration) {
          await self.registration.navigationPreload.enable();
        }
        // Clean old caches
        const keep = new Set([
          STATIC_CACHE,
          PAGE_CACHE,
          ASSET_CACHE,
          IMAGE_CACHE,
          FONT_CACHE,
        ]);
        const names = await caches.keys();
        await Promise.all(
          names.map((n) => (keep.has(n) ? null : caches.delete(n)))
        );
        await self.clients.claim();
      })()
    );
  });

  self.addEventListener("install", (event) => {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(PRECACHE_URLS);
      })()
    );
    // Activate immediately on install (you can remove if you prefer a softer update)
    self.skipWaiting();
  });

  self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") self.skipWaiting();
  });

  // Main fetch strategy router
  self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);

    // Only handle same-origin by default; let cross-origin pass through
    const sameOrigin = url.origin === self.location.origin;

    // Don’t try to cache analytics/telemetry; fail fast for speed/stability
    if (
      /google-analytics|googletagmanager|sentry|percy|stats|vitals/.test(
        url.hostname
      )
    ) {
      return;
    }

    // Navigation requests: network-first with offline fallback
    if (req.mode === "navigate") {
      event.respondWith(handleNavigation(event));
      return;
    }

    // Static assets by extension
    if (sameOrigin) {
      const pathname = url.pathname;
      if (/\.(?:js|mjs|css|map)$/.test(pathname)) {
        event.respondWith(staleWhileRevalidate(req, ASSET_CACHE));
        return;
      }
      if (/\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/.test(pathname)) {
        event.respondWith(
          cacheFirstWithLimit(req, IMAGE_CACHE, MAX_IMAGE_ENTRIES)
        );
        return;
      }
      if (/\.(?:woff2?|ttf|otf|eot)$/.test(pathname)) {
        event.respondWith(
          cacheFirstWithLimit(req, FONT_CACHE, MAX_FONT_ENTRIES)
        );
        return;
      }
      if (/\.(?:json|txt)$/.test(pathname)) {
        event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
        return;
      }
    }

    // Otherwise, don't intercept — let the network handle it.
    return;
  });

  // --- Strategies ---

  async function handleNavigation(event) {
    // Try navigation preload if available (faster HTML)
    const hasPreload = "navigationPreload" in self.registration;

    try {
      const response =
        (hasPreload && (await event.preloadResponse)) ||
        (await fetch(event.request));

      // Best-effort cache; never break navigation if caching fails
      (async () => {
        try {
          if (response && response.ok && response.type !== "opaqueredirect") {
            const pageCache = await caches.open(PAGE_CACHE);
            await pageCache.put(event.request, response.clone());
          }
        } catch {
          // ignore cache put errors
        }
      })();

      return response;
    } catch {
      // Network failed — serve last cached page or offline fallback
      const pageCache = await caches.open(PAGE_CACHE);
      const cached =
        (await pageCache.match(event.request, { ignoreSearch: true })) ||
        (await caches.match(OFFLINE_URL, { ignoreSearch: true }));
      return (
        cached ||
        new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        })
      );
    }
  }

  async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkPromise = fetch(request)
      .then((res) => {
        if (res && res.status === 200) cache.put(request, res.clone());
        return res;
      })
      .catch(() => null);

    // Return cache immediately if present; else wait for network
    return cached || (await networkPromise) || fetch(request);
  }

  async function cacheFirstWithLimit(request, cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const res = await fetch(request);
      if (res && res.status === 200) {
        await cache.put(request, res.clone());
        trimCache(cache, maxEntries).catch(() => {});
      }
      return res;
    } catch {
      // If fetch fails and we have nothing cached, propagate
      return new Response("", { status: 504 });
    }
  }

  // Keep cache sizes in check (oldest entries pruned)
  async function trimCache(cache, maxEntries) {
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;
    const toDelete = keys.length - maxEntries;
    for (let i = 0; i < toDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
} // End of desktop service worker logic
