"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const THEMES = [
  { id: "aurora", label: "Aurora", swatch: ["#8b6cff", "#38e1c8"] },
  { id: "sunset", label: "Sunset", swatch: ["#ff7a59", "#ffc55e"] },
  { id: "ocean", label: "Ocean", swatch: ["#2d9cdb", "#5eead4"] },
  { id: "forest", label: "Forest", swatch: ["#34c77b", "#e8c86a"] },
  { id: "ivory", label: "Ivory (light)", swatch: ["#634ad6", "#d48c3c"] },
  { id: "rose", label: "Rose (light)", swatch: ["#d64c80", "#b07c30"] },
] as const;

export const BACKGROUNDS = [
  { id: "mesh", label: "Aurora Mesh" },
  { id: "stars", label: "Starfield" },
  { id: "grid", label: "Blueprint Grid" },
  { id: "waves", label: "Waves" },
  { id: "plain", label: "Plain" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type BgId = (typeof BACKGROUNDS)[number]["id"];

type Ctx = {
  theme: ThemeId;
  bg: BgId;
  setTheme: (t: ThemeId) => void;
  setBg: (b: BgId) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("aurora");
  const [bg, setBgState] = useState<BgId>("mesh");

  useEffect(() => {
    try {
      const t = localStorage.getItem("theme") as ThemeId | null;
      const b = localStorage.getItem("bg") as BgId | null;
      if (t && THEMES.some((x) => x.id === t)) setThemeState(t);
      if (b && BACKGROUNDS.some((x) => x.id === b)) setBgState(b);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {}
  }, []);

  const setBg = useCallback((b: BgId) => {
    setBgState(b);
    try {
      localStorage.setItem("bg", b);
    } catch {}
  }, []);

  const value = useMemo(() => ({ theme, bg, setTheme, setBg }), [theme, bg, setTheme, setBg]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
