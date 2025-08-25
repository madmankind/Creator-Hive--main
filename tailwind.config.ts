import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors mapped to CSS variables
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        success: "var(--success)",
        warning: "var(--warn)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "monospace"],
      },
      fontSize: {
        // Mobile-first responsive type scale
        "display": ["clamp(2rem, 5vw, 2.5rem)", { lineHeight: "1.1", fontWeight: "800" }],
        "h1": ["clamp(1.5rem, 4vw, 1.75rem)", { lineHeight: "1.2", fontWeight: "700" }],
        "h2": ["clamp(1.125rem, 3vw, 1.25rem)", { lineHeight: "1.3", fontWeight: "600" }],
        "body": ["0.875rem", { lineHeight: "1.43" }],
        "label": ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
        "mono": ["0.75rem", { lineHeight: "1.5", fontFamily: "var(--font-mono)" }],
      },
      spacing: {
        // 4px grid system
        "0.5": "2px",
        "1": "4px", 
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "14": "56px", // toolbar height
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      height: {
        // Component heights
        "toolbar": "56px",
        "input": "44px",
        "input-desktop": "40px", 
        "button": "44px",
        "button-desktop": "40px",
      },
      borderRadius: {
        "card": "12px",
        "input": "10px",
        "button": "10px",
      },
      backdropBlur: {
        "glass": "10px",
      },
      boxShadow: {
        "focus": "0 0 0 2px color-mix(in oklab, var(--accent), white 20%)",
        "card": "0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.18), 0 0 0 1px var(--border)",
        "glass": "0 0 0 1px var(--border), 0 2px 16px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "card-hover": "cardHover 160ms ease-out",
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 200ms ease-out",
      },
      keyframes: {
        cardHover: {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-2px) scale(1.01)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;