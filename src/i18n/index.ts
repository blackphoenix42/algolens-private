// src/i18n/index.ts
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import translation files
import enTranslations from "./en/common.json";
import hiTranslations from "./hi/common.json";

const resources = {
  en: {
    common: enTranslations,
  },
  hi: {
    common: hiTranslations,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common"],

    // Language detection options
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "algolens-language",
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Debug only in development
    debug: import.meta.env.DEV,

    // Return empty string for missing keys in production
    returnEmptyString: !import.meta.env.DEV,

    // Key separator
    keySeparator: ".",

    // Namespace separator
    nsSeparator: ":",
  });

export default i18n;
export type Languages = keyof typeof resources;
export const supportedLanguages = Object.keys(resources) as Languages[];
