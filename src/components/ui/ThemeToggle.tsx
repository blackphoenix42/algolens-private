import React, { useCallback, useMemo } from "react";

import { useTheme } from "@/providers/ThemeProvider";
// import { log } from "@/services/monitoring";

const ThemeToggle = React.memo(() => {
  const { theme, toggle } = useTheme();

  const handleToggle = useCallback(() => {
    const _newTheme = theme === "dark" ? "light" : "dark";
    // log.user.action("Theme toggle", { from: theme, to: _newTheme });

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
      className="shadow-soft inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:scale-105 hover:bg-slate-50 active:scale-95 dark:border-white/20 dark:bg-white/10 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/20"
      title="Switch theme"
    >
      <span className="transition-colors duration-150">{text}</span>
      <span className="text-base transition-transform duration-150">
        {icon}
      </span>
    </button>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
