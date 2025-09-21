/**
 * Resource Preloader Utility
 *
 * Handles preloading of critical resources like fonts and images
 * to improve initial page load performance.
 */

interface PreloadOptions {
  fonts?: string[];
  images?: string[];
}

/**
 * Preload critical fonts
 */
const preloadFonts = async (
  fonts: string[] = ["400 1em Inter"]
): Promise<void> => {
  if (!document.fonts) {
    console.warn("Font loading API not supported");
    return;
  }

  try {
    const fontPromises = fonts.map((font) =>
      document.fonts.load(font).catch((error) => {
        console.warn(`Failed to preload font "${font}":`, error);
        // Don't throw - font loading is not critical
      })
    );

    await Promise.all(fontPromises);
    console.log("✅ Fonts preloaded successfully");
  } catch (error) {
    console.warn("Font preloading failed:", error);
  }
};

/**
 * Preload critical images
 */
const preloadImages = (images: string[]): void => {
  if (!Array.isArray(images) || images.length === 0) {
    return;
  }

  try {
    let loadedCount = 0;
    let failedCount = 0;

    images.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;

      link.onload = () => {
        loadedCount++;
        if (loadedCount + failedCount === images.length) {
          console.log(
            `✅ Image preloading complete: ${loadedCount} loaded, ${failedCount} failed`
          );
        }
      };

      link.onerror = (error) => {
        failedCount++;
        console.warn(`Failed to preload image "${src}":`, error);
        if (loadedCount + failedCount === images.length) {
          console.log(
            `✅ Image preloading complete: ${loadedCount} loaded, ${failedCount} failed`
          );
        }
      };

      document.head.appendChild(link);
    });
  } catch (error) {
    console.error("Image preloading setup failed:", error);
  }
};

/**
 * Default critical resources for AlgoLens
 */
const DEFAULT_CRITICAL_RESOURCES: PreloadOptions = {
  fonts: ["400 1em Inter"],
  images: [
    "/brand/AlgoLens.svg",
    "/brand/AlgoLens.png",
    "/brand/AlgoLens.webp",
  ],
};

/**
 * Preload critical resources for better performance
 */
export const preloadCriticalResources = async (
  options: PreloadOptions = DEFAULT_CRITICAL_RESOURCES
): Promise<void> => {
  console.log("🚀 Starting critical resource preloading");

  try {
    const {
      fonts = DEFAULT_CRITICAL_RESOURCES.fonts,
      images = DEFAULT_CRITICAL_RESOURCES.images,
    } = options;

    // Preload fonts (async)
    const fontPromise =
      fonts && fonts.length > 0 ? preloadFonts(fonts) : Promise.resolve();

    // Preload images (sync)
    if (images && images.length > 0) {
      preloadImages(images);
    }

    // Wait for fonts to load
    await fontPromise;

    console.log("✅ Critical resource preloading initiated");
  } catch (error) {
    console.error("Critical resource preloading failed:", error);
    // Don't throw - preloading is an optimization, not critical
  }
};

/**
 * Preload additional resources after initial load
 */
export const preloadSecondaryResources = (options: PreloadOptions): void => {
  // Defer secondary resource loading to avoid blocking main thread
  setTimeout(() => {
    preloadCriticalResources(options).catch((error) => {
      console.warn("Secondary resource preloading failed:", error);
    });
  }, 1000);
};
