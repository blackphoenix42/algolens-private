// src/i18n/LanguageSwitcher.tsx
import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import { useI18n, useLanguages } from "./hooks";
import type { Languages as LanguageType } from "./index";

import { cn } from "@/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dropdown" | "buttons";
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "dropdown",
  showLabel = false,
}) => {
  const { changeLanguage, currentLanguage } = useI18n();
  const languages = useLanguages();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Get current language info
  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle language selection
  const handleLanguageSelect = async (langCode: LanguageType) => {
    await changeLanguage(langCode);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  if (variant === "buttons") {
    return (
      <div className={cn("flex gap-2", className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "border border-transparent",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              currentLanguage === lang.code
                ? "bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:border-primary-800 shadow-soft"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
            aria-label={`Switch to ${lang.name}`}
            title={`Switch to ${lang.name}`}
          >
            <span className="flex items-center gap-2">
              <span>{lang.nativeName}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg",
          "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600",
          "text-slate-700 dark:text-slate-300",
          "hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          "shadow-soft hover:shadow-medium",
          isOpen &&
            "ring-2 ring-primary-500 border-primary-300 dark:border-primary-600"
        )}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {currentLanguage}
          </span>
          {showLabel && <span>{currentLang?.nativeName}</span>}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-[9999] mt-2 w-48",
            "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
            "rounded-xl shadow-large dark:shadow-slate-900/50",
            "overflow-hidden",
            "animate-in slide-in-from-top-2 duration-200"
          )}
          style={{
            top: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().bottom + 8
              : "auto",
            left: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().left
              : "auto",
          }}
          role="listbox"
        >
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageSelect(lang.code)}
              className={cn(
                "w-full px-4 py-3 text-left text-sm transition-colors duration-150",
                "hover:bg-slate-100 dark:hover:bg-slate-700",
                "focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700",
                "flex items-center justify-between gap-3",
                currentLanguage === lang.code &&
                  "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300",
                index === 0 && "rounded-t-xl",
                index === languages.length - 1 && "rounded-b-xl"
              )}
              role="option"
              aria-selected={currentLanguage === lang.code}
              title={`Switch to ${lang.name}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {lang.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {lang.code}
                </span>
                {currentLanguage === lang.code && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
