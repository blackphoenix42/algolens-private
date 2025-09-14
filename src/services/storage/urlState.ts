/**
 * URL state management for deep linking and state persistence
 * Enables sharing and bookmarking of specific algorithm states
 */

interface AlgorithmState {
  algorithm: string;
  data: number[];
  step: number;
  speed: number;
  isPlaying: boolean;
  customizations: Record<string, unknown>;
}

interface URLStateManager {
  encodeState: (state: AlgorithmState) => string;
  decodeState: (url: string) => AlgorithmState | null;
  updateURL: (state: AlgorithmState, replace?: boolean) => void;
  getStateFromURL: () => AlgorithmState | null;
  clearURLState: () => void;
}

class URLStateHandler implements URLStateManager {
  private static readonly STATE_PARAM = "state";
  private static readonly VERSION = "1";

  // Encode algorithm state to URL-safe string
  encodeState(state: AlgorithmState): string {
    try {
      const stateWithVersion = {
        v: URLStateHandler.VERSION,
        ...state,
      };

      const json = JSON.stringify(stateWithVersion);
      const compressed = this.compressString(json);
      return btoa(compressed).replace(/[+/=]/g, (match) => {
        return { "+": "-", "/": "_", "=": "" }[match] || match;
      });
    } catch (error) {
      console.error("Failed to encode state:", error);
      return "";
    }
  }

  // Decode URL-safe string to algorithm state
  decodeState(encodedState: string): AlgorithmState | null {
    try {
      // Restore base64 characters
      const base64 = encodedState.replace(/[-_]/g, (match) => {
        return { "-": "+", _: "/" }[match] || match;
      });

      // Add padding if needed
      const padded = base64 + "===".slice(0, (4 - (base64.length % 4)) % 4);

      const compressed = atob(padded);
      const json = this.decompressString(compressed);
      const stateWithVersion = JSON.parse(json);

      // Version compatibility check
      if (stateWithVersion.v !== URLStateHandler.VERSION) {
        console.warn("State version mismatch, attempting migration");
        return this.migrateState(stateWithVersion);
      }

      // Remove version field and return state
      // Drop version key and return remainder of state

      const { v: _omit, ...rest } = stateWithVersion;
      return rest as AlgorithmState;
    } catch (error) {
      console.error("Failed to decode state:", error);
      return null;
    }
  }

  // Update browser URL with current state
  updateURL(state: AlgorithmState, replace = false): void {
    try {
      const encodedState = this.encodeState(state);
      const url = new URL(window.location.href);

      if (encodedState) {
        url.searchParams.set(URLStateHandler.STATE_PARAM, encodedState);
      } else {
        url.searchParams.delete(URLStateHandler.STATE_PARAM);
      }

      const method = replace ? "replaceState" : "pushState";
      // Use explicit method calls instead of dynamic method invocation
      if (method === "replaceState") {
        window.history.replaceState({}, "", url.toString());
      } else {
        window.history.pushState({}, "", url.toString());
      }
    } catch (error) {
      console.error("Failed to update URL:", error);
    }
  }

  // Get state from current URL
  getStateFromURL(): AlgorithmState | null {
    try {
      const url = new URL(window.location.href);
      const encodedState = url.searchParams.get(URLStateHandler.STATE_PARAM);

      if (!encodedState) {
        return null;
      }

      return this.decodeState(encodedState);
    } catch (error) {
      console.error("Failed to get state from URL:", error);
      return null;
    }
  }

  // Clear state from URL
  clearURLState(): void {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete(URLStateHandler.STATE_PARAM);
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Failed to clear URL state:", error);
    }
  }

  // Simple compression using run-length encoding for repeated patterns
  private compressString(str: string): string {
    // For production, consider using a proper compression library like LZ-string
    // This is a simple implementation for demonstration
    return str.replace(/(.)\1{2,}/g, (match, char) => {
      return `${char}${match.length}`;
    });
  }

  // Simple decompression
  private decompressString(str: string): string {
    return str.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  // Migrate states from older versions
  private migrateState(
    oldState: Record<string, unknown>
  ): AlgorithmState | null {
    try {
      // Handle version migrations here
      // For now, just return the state with default values for missing fields
      return {
        algorithm: (oldState.algorithm as string) || "",
        data: (oldState.data as number[]) || [],
        step: (oldState.step as number) || 0,
        speed: (oldState.speed as number) || 1,
        isPlaying: (oldState.isPlaying as boolean) || false,
        customizations:
          (oldState.customizations as Record<string, unknown>) || {},
      };
    } catch (error) {
      console.error("Failed to migrate state:", error);
      return null;
    }
  }

  // Generate shareable URL
  generateShareableURL(state: AlgorithmState, baseURL?: string): string {
    const encoded = this.encodeState(state);
    const url = new URL(
      baseURL || window.location.origin + window.location.pathname
    );
    url.searchParams.set(URLStateHandler.STATE_PARAM, encoded);
    return url.toString();
  }

  // Copy shareable URL to clipboard
  async copyShareableURL(state: AlgorithmState): Promise<boolean> {
    try {
      const url = this.generateShareableURL(state);
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error("Failed to copy URL:", error);
      return false;
    }
  }

  // Parse URL parameters for algorithm routing
  parseAlgorithmURL(
    pathname: string
  ): { topic: string; algorithm: string } | null {
    const match = pathname.match(/^\/viz\/([^/]+)\/([^/]+)$/);
    if (match) {
      return {
        topic: decodeURIComponent(match[1]),
        algorithm: decodeURIComponent(match[2]),
      };
    }
    return null;
  }

  // Generate algorithm URL
  generateAlgorithmURL(
    topic: string,
    algorithm: string,
    state?: AlgorithmState
  ): string {
    const encodedTopic = encodeURIComponent(topic);
    const encodedAlgorithm = encodeURIComponent(algorithm);
    const path = `/viz/${encodedTopic}/${encodedAlgorithm}`;

    if (state) {
      const url = new URL(path, window.location.origin);
      const encodedState = this.encodeState(state);
      if (encodedState) {
        url.searchParams.set(URLStateHandler.STATE_PARAM, encodedState);
      }
      return url.toString();
    }

    return path;
  }
}

// React hook for URL state management
export function useURLState() {
  const [urlHandler] = React.useState(() => new URLStateHandler());
  const [currentState, setCurrentState] = React.useState<AlgorithmState | null>(
    null
  );

  // Initialize state from URL on mount
  React.useEffect(() => {
    const stateFromURL = urlHandler.getStateFromURL();
    if (stateFromURL) {
      setCurrentState(stateFromURL);
    }

    // Listen for browser navigation
    const handlePopState = () => {
      const newState = urlHandler.getStateFromURL();
      setCurrentState(newState);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [urlHandler]);

  const updateState = React.useCallback(
    (state: AlgorithmState, replace = false) => {
      setCurrentState(state);
      urlHandler.updateURL(state, replace);
    },
    [urlHandler]
  );

  const clearState = React.useCallback(() => {
    setCurrentState(null);
    urlHandler.clearURLState();
  }, [urlHandler]);

  const generateShareableURL = React.useCallback(
    (state: AlgorithmState) => {
      return urlHandler.generateShareableURL(state);
    },
    [urlHandler]
  );

  const copyShareableURL = React.useCallback(
    async (state: AlgorithmState) => {
      return urlHandler.copyShareableURL(state);
    },
    [urlHandler]
  );

  const parseAlgorithmURL = React.useCallback(
    (pathname: string) => {
      return urlHandler.parseAlgorithmURL(pathname);
    },
    [urlHandler]
  );

  const generateAlgorithmURL = React.useCallback(
    (topic: string, algorithm: string, state?: AlgorithmState) => {
      return urlHandler.generateAlgorithmURL(topic, algorithm, state);
    },
    [urlHandler]
  );

  return {
    currentState,
    updateState,
    clearState,
    generateShareableURL,
    copyShareableURL,
    parseAlgorithmURL,
    generateAlgorithmURL,
  };
}

// Import React for the hook
import React from "react";

export { URLStateHandler };
export type { AlgorithmState, URLStateManager };
