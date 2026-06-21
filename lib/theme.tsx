"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppTheme = "kinddo" | "ocean";

const storageKey = "kinddo-theme";

const ThemeContext = createContext<{
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}>({
  theme: "kinddo",
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("kinddo");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "kinddo" || saved === "ocean") {
      setThemeState(saved);
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  function setTheme(nextTheme: AppTheme) {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
  }

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
