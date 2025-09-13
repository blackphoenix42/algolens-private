import React from "react";

import { HomeIcon } from "./Icons";

export default function HomeButton() {
  return (
    <a
      href="/"
      className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1 text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/70"
      aria-label="Go to Home"
      title="Home"
    >
      <HomeIcon />
      <span className="hidden sm:inline">Home</span>
    </a>
  );
}
