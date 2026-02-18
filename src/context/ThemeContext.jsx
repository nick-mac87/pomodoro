import { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { retroTokens, cleanLightTokens, cleanDarkTokens } from "../themes/tokens.js";
import strings from "../utils/strings.js";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useLocalStorage("pixelpomo-theme", "clean");
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isRetro = themeMode === "retro";
  const tokens = isRetro
    ? retroTokens
    : systemDark
    ? cleanDarkTokens
    : cleanLightTokens;

  const variant = isRetro ? "retro" : systemDark ? "dark" : "light";

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(tokens).forEach(([key, value]) => {
      if (key.startsWith("--")) root.style.setProperty(key, value);
    });
    root.setAttribute("data-theme", isRetro ? "retro" : "clean");
    root.setAttribute("data-variant", variant);
  }, [tokens, isRetro, variant]);

  const toggleTheme = () =>
    setThemeMode((prev) => (prev === "retro" ? "clean" : "retro"));

  const s = isRetro ? strings.retro : strings.clean;

  return (
    <ThemeContext.Provider
      value={{ themeMode, isRetro, variant, toggleTheme, tokens, s }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
