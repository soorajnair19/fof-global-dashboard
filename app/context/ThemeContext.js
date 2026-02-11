"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "fof-theme";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
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

  const setTheme = (value) => {
    setThemeState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {mounted ? (
        <div
          className={`min-h-screen ${isDark ? "dark" : ""}`}
          style={{ background: "var(--fof-bg)", color: "var(--fof-text)" }}
        >
          {children}
        </div>
      ) : (
        <div className="min-h-screen" style={{ background: "#faf8ff" }}>
          {children}
        </div>
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
