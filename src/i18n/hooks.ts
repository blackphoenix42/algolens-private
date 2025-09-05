// src/i18n/hooks.ts
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Languages } from "./index";

/**
 * Custom hook for using translations
 * Provides type-safe access to translation functions
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation("common");
  const [currentLanguage, setCurrentLanguage] = useState<Languages>(
    (i18n.language as Languages) || "en"
  );

  const changeLanguage = useCallback(
    async (language: Languages) => {
      try {
        await i18n.changeLanguage(language);
        setCurrentLanguage(language);

        // Persist to localStorage
        localStorage.setItem("algolens-language", language);

        // Update document language attribute
        document.documentElement.lang = language;

        return true;
      } catch (error) {
        console.error("Failed to change language:", error);
        return false;
      }
    },
    [i18n]
  );

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as Languages);
      document.documentElement.lang = lng;
    };

    i18n.on("languageChanged", handleLanguageChange);

    // Set initial language
    handleLanguageChange(i18n.language);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  return {
    t,
    changeLanguage,
    currentLanguage,
    isReady: i18n.isInitialized,
  };
};

/**
 * Hook to get available languages
 */
export const useLanguages = () => {
  const languages: Array<{
    code: Languages;
    name: string;
    nativeName: string;
  }> = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  ];

  return languages;
};
