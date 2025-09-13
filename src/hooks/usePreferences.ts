/**
 * React hook for managing user preferences
 */

import { useCallback, useEffect, useState } from "react";

import { PreferencesManager, UserPreferences } from "@/services/storage";

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(
    PreferencesManager.getPreferences()
  );

  // Listen for preference changes from other components/tabs
  useEffect(() => {
    const handlePreferencesChange = (event: CustomEvent<UserPreferences>) => {
      setPreferences(event.detail);
    };

    window.addEventListener(
      "preferences-changed",
      handlePreferencesChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "preferences-changed",
        handlePreferencesChange as EventListener
      );
    };
  }, []);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      PreferencesManager.setPreference(key, value);
    },
    []
  );

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    PreferencesManager.setPreferences(updates);
  }, []);

  const resetPreferences = useCallback(() => {
    PreferencesManager.resetPreferences();
  }, []);

  const toggleTooltips = useCallback(() => {
    const newValue = !preferences.showTooltips;
    updatePreference("showTooltips", newValue);
    return newValue;
  }, [preferences.showTooltips, updatePreference]);

  const toggleHeroSection = useCallback(() => {
    const newValue = !preferences.showHeroSection;
    updatePreference("showHeroSection", newValue);
    return newValue;
  }, [preferences.showHeroSection, updatePreference]);

  const shouldShowOnboardingTour = useCallback(() => {
    return PreferencesManager.shouldShowOnboardingTour();
  }, []);

  const markOnboardingTourSeen = useCallback(() => {
    PreferencesManager.markOnboardingTourSeen();
  }, []);

  const resetOnboardingTour = useCallback(() => {
    PreferencesManager.resetOnboardingTour();
  }, []);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    toggleTooltips,
    toggleHeroSection,
    shouldShowOnboardingTour,
    markOnboardingTourSeen,
    resetOnboardingTour,
  };
}

export type { UserPreferences };
