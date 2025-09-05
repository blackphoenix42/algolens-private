import React, { useCallback, useMemo } from "react";

import { log } from "@/services/monitoring";
import { useTheme } from "@/theme/ThemeProvider";

const ThemeToggle = React.memo(() => {
  const { theme, toggle } = useTheme();

  const handleToggle = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    log.user.action("Theme toggle", { from: theme, to: newTheme });

    // Immediate toggle for responsiveness
    toggle();
  }, [theme, toggle]);

  const { text, icon } = useMemo(
    () => ({
      text: theme === "dark" ? "Dark" : "Light",
      icon: theme === "dark" ? "🌙" : "🌤️",
    }),
    [theme]
  );

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm bg-white/90 dark:bg-slate-800/90 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-150 ease-out will-change-transform hover:scale-105 active:scale-95"
      title="Switch theme"
    >
      <span className="text-sm font-medium transition-colors duration-150">
        {text}
      </span>
      <span className="text-lg transition-transform duration-150">{icon}</span>
    </button>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
