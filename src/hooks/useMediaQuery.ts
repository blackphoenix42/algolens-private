import { useEffect, useState } from "react";

/**
 * Hook to detect media query matches
 * @param query - The media query string to match against
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener("change", listener);

    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/**
 * Hook to detect various screen sizes and device types
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
  };
}
