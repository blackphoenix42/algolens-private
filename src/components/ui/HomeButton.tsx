import React from "react";

import { HomeIcon } from "./Icons";

export default function HomeButton() {
  return (
    <a
      href="/"
      className="inline-flex items-center gap-2 px-2 py-1 rounded border
                 bg-white text-slate-900 border-slate-200 hover:bg-slate-100
                 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800/70
                 transition-colors"
      aria-label="Go to Home"
      title="Home"
    >
      <HomeIcon />
      <span className="hidden sm:inline">Home</span>
    </a>
  );
}
