import type { Config } from "tailwindcss";

const withAlpha = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: withAlpha("bg"),
        surface: withAlpha("surface"),
        text: withAlpha("text"),
        muted: withAlpha("muted"),
        primary: withAlpha("primary"),
        accent: withAlpha("accent"),
        border: withAlpha("border"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgb(var(--primary) / 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
