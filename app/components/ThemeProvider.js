"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "fof-theme";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark =
      stored === "dark" || (stored !== "light" && prefersDark);
    setThemeState(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.toggle("dark", theme === "dark");
  }, [mounted, theme]);

  const setTheme = (next) => {
    const value = next === "dark" ? "dark" : "light";
    setThemeState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme === "dark" ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
}
