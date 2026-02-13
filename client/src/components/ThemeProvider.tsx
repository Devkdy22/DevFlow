import { useState, useEffect, type ReactNode } from "react";
import { ThemeContext, type Theme, type ThemeMode } from "./ThemeContext";

const THEME_MODE_KEY = "themeMode";

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem(THEME_MODE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "system";
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [theme, setTheme] = useState<Theme>(() =>
    themeMode === "system" ? getSystemTheme() : themeMode
  );

  useEffect(() => {
    const nextTheme = themeMode === "system" ? getSystemTheme() : themeMode;
    setTheme(nextTheme);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(nextTheme);
    localStorage.setItem(THEME_MODE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = mediaQuery.matches ? "dark" : "light";
      setTheme(next);
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(next);
    };
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev =>
      prev === "light" ? "dark" : prev === "dark" ? "system" : "light"
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
