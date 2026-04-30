import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paper & ink
        paper: {
          DEFAULT: "var(--paper)",
          2: "var(--paper-2)",
          soft: "var(--paper-soft)",
          card: "var(--paper-card)",
        },
        ink: "var(--ink)",
        t: {
          1: "var(--t-1)",
          2: "var(--t-2)",
          3: "var(--t-3)",
          4: "var(--t-4)",
        },
        // Accents
        plum: { DEFAULT: "var(--plum)", 2: "var(--plum-2)" },
        tan: "var(--tan)",
        rust: "var(--rust)",
        moss: "var(--moss)",
        slate: "var(--slate)",
        // Lines
        rule: { DEFAULT: "var(--rule)", 2: "var(--rule-2)" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
        tight: "-0.015em",
        editorial: "-0.005em",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        topbar: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        topbar: "topbar 1.2s ease-in-out infinite",
        "fade-in": "fadeIn 240ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
