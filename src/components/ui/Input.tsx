import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef, useState } from "react";

import { cn } from "@/utils";

const inputVariants = cva(
  "flex w-full rounded-xl border px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:border-primary-500 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-600",
        outline:
          "border-2 border-primary-600 bg-transparent focus:bg-primary-50 dark:border-primary-400 dark:focus:bg-primary-950",
        ghost:
          "border-transparent bg-slate-100 hover:bg-slate-200 focus:bg-white focus:border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus:bg-slate-900",
      },
      inputSize: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-11 px-4 text-base",
      },
      state: {
        default: "",
        error: "border-error-500 focus:ring-error-500 focus:border-error-500",
        success:
          "border-success-500 focus:ring-success-500 focus:border-success-500",
        warning:
          "border-warning-500 focus:ring-warning-500 focus:border-warning-500",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
      state: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant,
      inputSize,
      state,
      label,
      error,
      success,
      warning,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Determine state based on props
    const currentState = error
      ? "error"
      : success
        ? "success"
        : warning
          ? "warning"
          : state;

    // Get message to display
    const message = error || success || warning || helperText;

    // Get message color
    const getMessageColor = () => {
      if (error) return "text-error-600 dark:text-error-400";
      if (success) return "text-success-600 dark:text-success-400";
      if (warning) return "text-warning-600 dark:text-warning-400";
      return "text-slate-600 dark:text-slate-400";
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              inputVariants({ variant, inputSize, state: currentState }),
              leftIcon && "pl-10",
              (rightIcon || loading) && "pr-10",
              isFocused && "ring-2 ring-primary-500 ring-opacity-20",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {(rightIcon || loading) && (
            <div
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500",
                onRightIconClick &&
                  "cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
              )}
              onClick={onRightIconClick}
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {message && (
          <p className={cn("mt-2 text-sm", getMessageColor())}>{message}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
