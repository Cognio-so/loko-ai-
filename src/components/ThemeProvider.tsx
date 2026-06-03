"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "midnight" | "blue-neon" | "purple-ai" | "glass";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedTheme = window.localStorage.getItem(storageKey);
  return isTheme(storedTheme) ? storedTheme : defaultTheme;
}

export function isTheme(value: unknown): value is Theme {
  return (
    value === "light" ||
    value === "dark" ||
    value === "midnight" ||
    value === "blue-neon" ||
    value === "purple-ai" ||
    value === "glass"
  );
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "theme",
}: ThemeProviderProps) {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("themechange", onStoreChange);

    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener("themechange", onStoreChange);
    };
  }, []);

  const theme = React.useSyncExternalStore(
    subscribe,
    () => getStoredTheme(storageKey, defaultTheme),
    () => defaultTheme
  );

  const applyTheme = React.useCallback((nextTheme: Theme) => {
    const root = document.documentElement;
    const isDarkTheme = nextTheme !== "light";

    root.classList.remove("light", "dark", "midnight", "blue-neon", "purple-ai", "glass");
    root.classList.add(nextTheme);
    root.classList.toggle("dark", isDarkTheme);
    root.dataset.theme = nextTheme;
    root.style.colorScheme = isDarkTheme ? "dark" : "light";
  }, []);

  React.useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    applyTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    window.dispatchEvent(new Event("themechange"));
  }, [applyTheme, storageKey]);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
