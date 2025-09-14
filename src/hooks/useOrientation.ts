import { useEffect, useState } from "react";

export type OrientationType = "portrait" | "landscape";

/**
 * Hook to detect screen orientation
 * @returns current orientation and whether it's currently portrait
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<OrientationType>(() => {
    // Check initial orientation
    if (typeof window !== "undefined") {
      return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
    }
    return "landscape";
  });

  useEffect(() => {
    const updateOrientation = () => {
      const newOrientation =
        window.innerHeight > window.innerWidth ? "portrait" : "landscape";
      setOrientation(newOrientation);
    };

    // Listen to resize events for orientation changes
    window.addEventListener("resize", updateOrientation);

    // Listen to orientation change event (mobile devices)
    if ("screen" in window && "orientation" in window.screen) {
      window.addEventListener("orientationchange", () => {
        // Add a small delay to ensure the viewport has updated
        setTimeout(updateOrientation, 100);
      });
    }

    // Initial check
    updateOrientation();

    return () => {
      window.removeEventListener("resize", updateOrientation);
      if ("screen" in window && "orientation" in window.screen) {
        window.removeEventListener("orientationchange", updateOrientation);
      }
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === "portrait",
    isLandscape: orientation === "landscape",
  };
}

/**
 * Hook that combines mobile detection with orientation
 * Useful for determining when to show mobile-specific UI
 */
export function useMobileOrientation() {
  const [isMobile, setIsMobile] = useState(false);
  const { orientation, isPortrait, isLandscape } = useOrientation();

  useEffect(() => {
    const checkMobile = () => {
      // Consider device mobile if viewport width is <= 768px OR it's a touch device
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isSmallScreen || (hasTouch && window.innerWidth <= 1024));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return {
    isMobile,
    orientation,
    isPortrait,
    isLandscape,
    isMobilePortrait: isMobile && isPortrait,
    isMobileLandscape: isMobile && isLandscape,
  };
}
