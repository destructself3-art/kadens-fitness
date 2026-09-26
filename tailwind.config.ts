import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "560px",
      md: "820px",
      lg: "1100px",
      xl: "1360px",
      "2xl": "1600px",
    },
    extend: {
      colors: {
        asphalt: token("asphalt"),
        graphite: token("graphite"),
        raised: token("raised"),
        chalk: token("chalk"),
        dust: token("dust"),
        line: token("line"),
        pulse: token("pulse"),
        z1: token("z1"),
        z2: token("z2"),
        z3: token("z3"),
        z4: token("z4"),
        z5: token("z5"),
      },
      // Names with spaces must be quoted: Tailwind 3 prints them as-is,
      // and one invalid name drops the whole font-family declaration.
      fontFamily: {
        display: ["var(--font-display)", '"Arial Narrow"', "Arial", "sans-serif"],
        sans: ["var(--font-sans)", '"Segoe UI"', '"Helvetica Neue"', "Arial", "sans-serif"],
        digits: ["var(--font-digits)", "ui-monospace", '"Cascadia Mono"', "Consolas", "monospace"],
      },
      fontSize: {
        // Display sizes are fluid, text sizes fixed
        "d-1": ["clamp(3.2rem, 11vw, 11rem)", { lineHeight: "0.82", letterSpacing: "-0.01em" }],
        "d-2": ["clamp(2.5rem, 6.4vw, 6.4rem)", { lineHeight: "0.88", letterSpacing: "-0.005em" }],
        "d-3": ["clamp(1.9rem, 3.8vw, 3.6rem)", { lineHeight: "0.95", letterSpacing: "0" }],
        "d-4": ["clamp(1.4rem, 2.2vw, 2rem)", { lineHeight: "1", letterSpacing: "0.01em" }],
      },
      borderRadius: {
        card: "20px",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      maxWidth: {
        page: "1360px",
      },
      keyframes: {
        "live-ping": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.6)", opacity: "0" },
        },
      },
      animation: {
        "live-ping": "live-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
