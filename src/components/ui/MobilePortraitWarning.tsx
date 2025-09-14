import { useI18n } from "@/i18n";

interface MobilePortraitWarningProps {
  isVisible: boolean;
}

/**
 * Full-screen overlay that appears when user is on mobile in portrait mode
 * Encourages switching to landscape for better visualization experience
 */
export default function MobilePortraitWarning({
  isVisible,
}: MobilePortraitWarningProps) {
  const { t } = useI18n();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-4 max-w-sm text-center">
        {/* Rotation Icon Animation */}
        <div className="bg-primary-100 dark:bg-primary-900/20 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <div className="animate-bounce">
            <svg
              className="text-primary-600 dark:text-primary-400 h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-xl font-bold text-white">
          {t("mobile.rotateDevice", { defaultValue: "Rotate Your Device" })}
        </h2>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          {t("mobile.landscapeRecommended", {
            defaultValue:
              "For the best visualization experience, please rotate your device to landscape mode.",
          })}
        </p>

        {/* Visual Indicator */}
        <div className="flex items-center justify-center space-x-4 text-slate-400">
          {/* Portrait Phone (Current) */}
          <div className="flex flex-col items-center">
            <div className="mb-2 h-12 w-8 rounded-lg border-2 border-slate-400 bg-slate-700">
              <div className="mx-auto mt-1 h-1 w-3 rounded-full bg-slate-400"></div>
              <div className="mx-auto mt-1 h-6 w-6 rounded bg-slate-400"></div>
            </div>
            <span className="text-xs opacity-75">Portrait</span>
          </div>

          {/* Arrow */}
          <div className="animate-pulse">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          {/* Landscape Phone (Target) */}
          <div className="flex flex-col items-center">
            <div className="border-primary-400 bg-primary-700 mb-2 h-8 w-12 rounded-lg border-2">
              <div className="bg-primary-300 mt-1 ml-1 h-1 w-3 rounded-full"></div>
              <div className="bg-primary-300 mx-auto mt-1 h-4 w-8 rounded"></div>
            </div>
            <span className="text-primary-400 text-xs">Landscape</span>
          </div>
        </div>

        {/* Additional tip */}
        <div className="mt-6 rounded-lg bg-slate-800 p-3">
          <p className="text-xs text-slate-400">
            💡{" "}
            {t("mobile.tip", {
              defaultValue:
                "Tip: You can also use fullscreen mode for an even better experience!",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
