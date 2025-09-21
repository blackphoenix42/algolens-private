// src/components/ui/LoadingScreen.tsx
import { cn } from "@/utils";

/**
 * Props for the LoadingScreen component
 */
interface LoadingScreenProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current loading phase description */
  phase: string;
  /** Algorithm topic (optional) */
  topic?: string;
  /** Algorithm slug (optional) */
  slug?: string;
  /** Whether the screen is in mobile view */
  isMobile?: boolean;
}

/**
 * Enhanced loading screen component with animated progress tracking
 *
 * Features:
 * - Real-time progress bar with shimmer effects
 * - Animated logo with rotating rings and floating particles
 * - Mobile-responsive design
 * - Algorithm information display
 * - Multiple loading phase indicators
 *
 * @param props - LoadingScreenProps
 * @returns LoadingScreen component
 */
export default function LoadingScreen({
  progress,
  phase,
  topic,
  slug,
  isMobile = false,
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div
        className={cn(
          "mx-auto px-6 text-center",
          isMobile ? "max-w-sm" : "max-w-md"
        )}
      >
        {/* Animated Logo/Icon */}
        <div className="relative mb-8">
          <div
            className={cn(
              "mx-auto rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-1 shadow-2xl",
              isMobile ? "h-16 w-16" : "h-20 w-20"
            )}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-800">
              <div className="relative">
                {/* Outer rotating ring */}
                <div
                  className={cn(
                    "absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500 border-r-indigo-500",
                    isMobile ? "h-10 w-10" : "h-12 w-12"
                  )}
                ></div>
                {/* Inner pulsing core */}
                <div
                  className={cn(
                    "animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20",
                    isMobile ? "h-10 w-10" : "h-12 w-12"
                  )}
                ></div>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className={cn(
                      "text-blue-600 dark:text-blue-400",
                      isMobile ? "h-5 w-5" : "h-6 w-6"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Floating particles */}
          <div className="absolute -top-2 -left-2 h-2 w-2 animate-ping rounded-full bg-blue-400 opacity-75"></div>
          <div
            className="absolute -right-3 -bottom-1 h-1.5 w-1.5 animate-ping rounded-full bg-indigo-400 opacity-75"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-1 -right-1 h-1 w-1 animate-ping rounded-full bg-purple-400 opacity-75"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <span
              className={cn(
                "font-medium text-slate-700 dark:text-slate-300",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Loading Progress
            </span>
            <span
              className={cn(
                "font-bold text-blue-600 dark:text-blue-400",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {progress}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-slate-700">
            <div
              className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              {/* Moving highlight */}
              <div
                className="absolute inset-0 -skew-x-12 transform animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ animationDuration: "2s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Loading Phase Text */}
        <div className="mb-8">
          <h3
            className={cn(
              "mb-2 font-semibold text-slate-800 dark:text-slate-100",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            AlgoLens Visualizer
          </h3>
          <p
            className={cn(
              "animate-pulse text-slate-600 dark:text-slate-400",
              isMobile ? "text-xs" : "text-sm"
            )}
          >
            {phase}
          </p>
        </div>

        {/* Algorithm Info */}
        <div className="rounded-lg border border-slate-200 bg-white/50 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50">
          <p
            className={cn(
              "mb-1 text-slate-500 dark:text-slate-400",
              isMobile ? "text-xs" : "text-xs"
            )}
          >
            Loading Algorithm:
          </p>
          <p
            className={cn(
              "font-medium text-slate-700 dark:text-slate-300",
              isMobile ? "text-xs" : "text-sm"
            )}
          >
            {topic && slug ? `${topic}/${slug}` : "Detecting algorithm..."}
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="mt-6 flex justify-center space-x-1">
          <div
            className={cn(
              "animate-bounce rounded-full bg-blue-500",
              isMobile ? "h-1.5 w-1.5" : "h-2 w-2"
            )}
          ></div>
          <div
            className={cn(
              "animate-bounce rounded-full bg-indigo-500",
              isMobile ? "h-1.5 w-1.5" : "h-2 w-2"
            )}
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className={cn(
              "animate-bounce rounded-full bg-purple-500",
              isMobile ? "h-1.5 w-1.5" : "h-2 w-2"
            )}
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
