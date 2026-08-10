import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        night: {
          DEFAULT: "#050d1f", // page ground
          800: "#06122b", // deep court navy (old --bg)
          700: "#0a1c3f", // panel navy (old --bg-2)
        },
        royal: {
          DEFAULT: "#1b74e0", // paddle royal blue
          bright: "#4fa0ff",
          deep: "#0d3f8f",
          ink: "#0d2a55",
        },
        lime: {
          DEFAULT: "#cbe66e", // crest lime
          bright: "#e2f59a",
        },
        ball: "#efeee6", // wiffle ball cream
        ink: {
          DEFAULT: "#eef4ff",
          soft: "#9fb2d4",
          dim: "#5f7196",
        },
        line: "rgba(146,190,255,0.14)",
        // shadcn semantic tokens
        border: "rgba(146,190,255,0.14)",
        input: "rgba(146,190,255,0.2)",
        ring: "#4fa0ff",
        background: "#050d1f",
        foreground: "#eef4ff",
        primary: { DEFAULT: "#cbe66e", foreground: "#06122b" },
        secondary: { DEFAULT: "#1b74e0", foreground: "#eef4ff" },
        destructive: { DEFAULT: "#f16363", foreground: "#eef4ff" },
        muted: { DEFAULT: "#0a1c3f", foreground: "#9fb2d4" },
        accent: { DEFAULT: "#12264f", foreground: "#eef4ff" },
        popover: { DEFAULT: "#0a1c3f", foreground: "#eef4ff" },
        card: { DEFAULT: "rgba(255,255,255,0.045)", foreground: "#eef4ff" },
      },
      fontFamily: {
        display: ['"Anton"', "system-ui", "sans-serif"],
        condensed: ['"Bebas Neue"', "system-ui", "sans-serif"],
        body: ['"Manrope Variable"', "Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 10vw, 9rem)", { lineHeight: "0.92", letterSpacing: "0.01em" }],
        "display-lg": ["clamp(2.75rem, 7vw, 6rem)", { lineHeight: "0.95", letterSpacing: "0.01em" }],
        "display-md": ["clamp(2rem, 5vw, 3.75rem)", { lineHeight: "1", letterSpacing: "0.01em" }],
        kicker: ["0.8125rem", { lineHeight: "1.2", letterSpacing: "0.32em" }],
      },
      borderRadius: {
        lg: "1.25rem",
        md: "0.875rem",
        sm: "0.625rem",
      },
      boxShadow: {
        "glow-lime": "0 0 40px -8px rgba(203,230,110,0.45)",
        "glow-blue": "0 0 60px -10px rgba(27,116,224,0.55)",
        "card-deep": "0 24px 60px -24px rgba(0,0,0,0.65)",
      },
      backgroundImage: {
        "court-grid":
          "linear-gradient(rgba(146,190,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(146,190,255,0.05) 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
