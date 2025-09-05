/**
 * User preferences management for AlgoLens
 * Handles persistent storage of user preferences
 */

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  showTooltips: boolean;
  showOnboardingTour: boolean;
  showHeroSection: boolean;
  animationSpeed: number;
  autoPlay: boolean;
  performanceMonitorEnabled: boolean;
  narrationEnabled: boolean;
  reducedMotion: boolean;
  lastSeenOnboardingVersion: string;
}

class PreferencesManager {
  private static readonly STORAGE_KEY = "algolens-preferences";
  private static readonly VERSION = "1.0.0";

  private static readonly DEFAULT_PREFERENCES: UserPreferences = {
    theme: "system",
    showTooltips: true,
    showOnboardingTour: true,
    showHeroSection: true,
    animationSpeed: 1,
    autoPlay: false,
    performanceMonitorEnabled: false,
    narrationEnabled: false,
    reducedMotion: false,
    lastSeenOnboardingVersion: "0.0.0",
  };

  static getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn("Failed to load preferences:", error);
    }
    return { ...this.DEFAULT_PREFERENCES };
  }

  static setPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

      // Dispatch event for components to listen to preference changes
      window.dispatchEvent(
        new CustomEvent("preferences-changed", {
          detail: updated,
        })
      );
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }

  static getPreference<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] {
    const preferences = this.getPreferences();
    return preferences[key];
  }

  static setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.setPreferences({ [key]: value } as Partial<UserPreferences>);
  }

  static resetPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent("preferences-changed", {
          detail: this.DEFAULT_PREFERENCES,
        })
      );
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  }

  static shouldShowTooltips(): boolean {
    return this.getPreference("showTooltips");
  }

  static disableTooltips(): void {
    this.setPreference("showTooltips", false);
  }

  static enableTooltips(): void {
    this.setPreference("showTooltips", true);
  }

  static shouldShowOnboardingTour(): boolean {
    const preferences = this.getPreferences();
    const shouldShow =
      preferences.showOnboardingTour &&
      preferences.lastSeenOnboardingVersion !== this.VERSION;

    if (typeof window !== "undefined" && import.meta.env.DEV) {
      console.log("shouldShowOnboardingTour check:", {
        showOnboardingTour: preferences.showOnboardingTour,
        lastSeenVersion: preferences.lastSeenOnboardingVersion,
        currentVersion: this.VERSION,
        shouldShow,
      });
    }

    return shouldShow;
  }

  static markOnboardingTourSeen(): void {
    if (typeof window !== "undefined" && import.meta.env.DEV) {
      console.log("Marking onboarding tour as seen, version:", this.VERSION);
    }
    this.setPreferences({
      showOnboardingTour: false,
      lastSeenOnboardingVersion: this.VERSION,
    });
  }

  static resetOnboardingTour(): void {
    this.setPreferences({
      showOnboardingTour: true,
      lastSeenOnboardingVersion: "0.0.0",
    });
  }
}

export { PreferencesManager };
