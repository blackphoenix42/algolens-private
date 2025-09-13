import React, { useState, useEffect, useRef } from "react";

import { Input } from "./Input";

import { cn, debounce } from "@/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  showSuggestions?: boolean;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search algorithms...",
  className,
  debounceMs = 300,
  onSearch,
  onClear,
  suggestions = [],
  showSuggestions = false,
  loading = false,
  disabled = false,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Debounced search function
  const debouncedSearch = debounce((searchValue: string) => {
    onChange(searchValue);
    onSearch?.(searchValue);
  }, debounceMs);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setSelectedIndex(-1);

    if (showSuggestions && suggestions.length > 0) {
      setShowDropdown(newValue.length > 0);
    }

    debouncedSearch(newValue);
  };

  // Handle clear
  const handleClear = () => {
    setInternalValue("");
    setShowDropdown(false);
    setSelectedIndex(-1);
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setInternalValue(suggestion);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onChange(suggestion);
    onSearch?.(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        onSearch?.(internalValue);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          onSearch?.(internalValue);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(internalValue.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (
            showSuggestions &&
            filteredSuggestions.length > 0 &&
            internalValue.length > 0
          ) {
            setShowDropdown(true);
          }
        }}
        disabled={disabled}
        loading={loading}
        leftIcon={
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        rightIcon={
          internalValue && !loading ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : undefined
        }
      />

      {/* Suggestions Dropdown */}
      {showDropdown && showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-large max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                "w-full px-4 py-2 text-left text-sm transition-colors",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800",
                index === selectedIndex && "bg-slate-100 dark:bg-slate-800",
                index === 0 && "rounded-t-xl",
                index === filteredSuggestions.length - 1 && "rounded-b-xl"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              aria-label={`Use suggestion ${suggestion}`}
              title={`Use suggestion ${suggestion}`}
            >
              <span className="flex items-center">
                <svg
                  className="h-4 w-4 mr-2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>{suggestion}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
