// src/i18n/LanguageContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useI18n } from "./hooks";
import type { Languages } from "./index";

interface LanguageContextType {
  currentLanguage: Languages;
  changeLanguage: (language: Languages) => Promise<boolean>;
  availableLanguages: Array<{
    code: Languages;
    name: string;
    nativeName: string;
  }>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { currentLanguage, changeLanguage: i18nChangeLanguage } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const availableLanguages = [
    { code: "en" as Languages, name: "English", nativeName: "English" },
    { code: "hi" as Languages, name: "Hindi", nativeName: "हिन्दी" },
  ];

  const changeLanguage = useCallback(
    async (language: Languages): Promise<boolean> => {
      setIsLoading(true);
      try {
        const success = await i18nChangeLanguage(language);
        return success;
      } finally {
        setIsLoading(false);
      }
    },
    [i18nChangeLanguage]
  );

  // Initialize language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "algolens-language"
    ) as Languages;
    if (savedLanguage && savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage);
    }
  }, [currentLanguage, changeLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider"
    );
  }
  return context;
};
