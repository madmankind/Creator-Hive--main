import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F14",
        surface: "#0D1117",
        text: {
          primary: "#E6E8EC",
          dim: "#9AA3B2",
        },
        ring: "#222833",
        accent: "#22D3EE",
      },
      fontFamily: {
        // Primary app font. Prefer using `font-sans` everywhere.
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        // super subtle border-ish glow for controls
        "inner-subtle": "inset 0 0 0 1px rgba(255,255,255,0.04)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
} satisfies Config;







