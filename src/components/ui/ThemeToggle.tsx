import React, { useCallback, useMemo } from "react";

import { useTheme } from "@/providers/ThemeProvider";
import { log } from "@/services/monitoring";

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
      className="inline-flex items-center gap-2 rounded-lg border bg-white/90 px-3 py-2 shadow-sm transition-all duration-150 ease-out will-change-transform hover:scale-105 hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/90 dark:hover:bg-slate-800"
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
