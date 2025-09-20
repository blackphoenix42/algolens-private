import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";
type ThemeCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const Ctx = createContext<ThemeCtx | null>(null);
// const KEY = "ui-theme"; // Disabled localStorage usage
function apply(t: Theme) {
  const el = document.documentElement;
  if (t === "dark") el.classList.add("dark");
  else el.classList.remove("dark");
  el.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always use dark theme - no localStorage
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    apply(theme);
    // localStorage.setItem(KEY, theme); // Disabled localStorage usage
  }, [theme]);

  // Disabled storage sync since we're not using localStorage
  // useEffect(() => {
  //   const onStorage = (e: StorageEvent) => {
  //     if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark"))
  //       setTheme(e.newValue);
  //   };
  //   window.addEventListener("storage", onStorage);
  //   return () => window.removeEventListener("storage", onStorage);
  // }, []);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme,
      toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
