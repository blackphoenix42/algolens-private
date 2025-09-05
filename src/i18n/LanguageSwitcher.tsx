// src/i18n/LanguageSwitcher.tsx
import { Languages } from "lucide-react";
import React from "react";

import { useI18n, useLanguages } from "./hooks";
import type { Languages as LanguageType } from "./index";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dropdown" | "buttons";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "dropdown",
}) => {
  const { changeLanguage, currentLanguage } = useI18n();
  const languages = useLanguages();

  if (variant === "buttons") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${
                currentLanguage === lang.code
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
            aria-label={`Switch to ${lang.name}`}
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value as LanguageType)}
        className="
          appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 pr-8
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-gray-400 dark:hover:border-gray-500
          transition-colors cursor-pointer
        "
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
      <Languages className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};
