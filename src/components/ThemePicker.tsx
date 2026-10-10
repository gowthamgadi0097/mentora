"use client";

import { useEffect, useRef, useState } from "react";
import { BACKGROUNDS, THEMES, useTheme } from "./ThemeProvider";

export default function ThemePicker() {
  const { theme, bg, setTheme, setBg } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn-ghost !px-3"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden>🎨</span>
        <span className="hidden sm:inline">Appearance</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Appearance settings"
          className="glass absolute right-0 z-50 mt-2 w-72 rounded-2xl p-4 shadow-glow"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Colour theme</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`rounded-xl border p-2 text-center text-xs transition ${
                  theme === t.id ? "border-primary bg-primary/10" : "border-border/60 hover:bg-surface"
                }`}
              >
                <span
                  className="mx-auto mb-1 block h-6 w-full rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})` }}
                />
                {t.label.split(" ")[0]}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Background</p>
          <div className="flex flex-wrap gap-2">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBg(b.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  bg === b.id ? "border-primary bg-primary/15 text-text" : "border-border/60 text-muted hover:text-text"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
