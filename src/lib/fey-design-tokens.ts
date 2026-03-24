/**
 * Fey-inspired design tokens for Campaign Command Center
 * Single source of truth for all visual patterns
 */

export const feyTokens = {
  // Colors
  colors: {
    // Base dark palette
    base: {
      black: "#07070A",
      dark: "#0A0A0E",
      darker: "#050507",
    },
    // Red gradient system
    red: {
      glow: "#E5484D", // Primary red accent
      deep: "#C41E3A", // Deep crimson
      bloom: "rgba(255,60,60,0.18)", // Top-left bloom
      bloomSecondary: "rgba(255,90,60,0.10)", // Secondary bloom
      pill: "#E5484D", // Selected pill color
      pillGlow: "rgba(229,72,77,0.3)", // Pill glow shadow
    },
    // Text hierarchy
    text: {
      primary: "rgba(255,255,255,0.95)",
      secondary: "rgba(255,255,255,0.80)",
      muted: "rgba(255,255,255,0.50)",
      label: "rgba(255,255,255,0.40)",
    },
    // Chart colors (limited, premium palette)
    chart: {
      primary: "#E5484D",
      secondary: "#E3A23A",
      tertiary: "#8B5CF6",
      quaternary: "#10B981",
    },
    // Status colors
    status: {
      success: "#10B981",
      warning: "#E3A23A",
      error: "#E5484D",
      info: "#8B5CF6",
    },
  },

  // Border system
  borders: {
    default: "rgba(255,255,255,0.04)",
    hover: "rgba(255,255,255,0.08)",
    active: "rgba(229,72,77,0.3)",
    subtle: "rgba(255,255,255,0.02)",
  },

  // Glass effects
  glass: {
    panel: {
      background: "rgba(255,255,255,0.02)",
      border: "rgba(255,255,255,0.04)",
      backdrop: "backdrop-blur-xl",
    },
    card: {
      background: "rgba(255,255,255,0.03)",
      border: "rgba(255,255,255,0.04)",
      backdrop: "backdrop-blur-lg",
    },
    tooltip: {
      background: "rgba(10,10,14,0.95)",
      border: "rgba(255,255,255,0.08)",
      backdrop: "backdrop-blur-xl",
    },
  },

  // Shadows (layered, soft)
  shadows: {
    surface: "0 4px 16px rgba(0,0,0,0.3)",
    card: "0 8px 32px rgba(0,0,0,0.4)",
    hover: "0 12px 48px rgba(0,0,0,0.5)",
    modal: "0 16px 64px rgba(0,0,0,0.6)",
    glow: "0 0 20px rgba(229,72,77,0.3)",
    inner: "inset 0 1px 0 rgba(255,255,255,0.05)",
  },

  // Border radius (consistent)
  radius: {
    panel: "18px",
    card: "18px",
    pill: "9999px",
    button: "12px",
  },

  // Typography
  typography: {
    // Font sizes
    size: {
      pageTitle: "24px",
      sectionTitle: "16px",
      cardTitle: "14px",
      body: "13px",
      small: "12px",
      micro: "11px",
      label: "10px",
      tiny: "9px",
    },
    // Font weights
    weight: {
      semibold: "600",
      medium: "500",
      regular: "400",
    },
    // Letter spacing
    tracking: {
      tight: "-0.02em",
      normal: "0",
      wide: "0.08em",
      wider: "0.12em",
    },
  },

  // Spacing (8px grid)
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },

  // Background overlays (reusable)
  overlays: {
    // Dotted/halftone texture (SVG pattern)
    dots: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    // Noise texture (SVG filter)
    noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    // Ribbed gradient (subtle vertical lines)
    ribbed: `repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(255,255,255,0.01) 1px,
      rgba(255,255,255,0.01) 2px
    )`,
  },

  // Mesh layer presets
  mesh: {
    chart: {
      intensity: 0.10,
      dotSize: "1px",
      spacing: "60px",
      mask: "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)",
    },
    panel: {
      intensity: 0.08,
      dotSize: "1px",
      spacing: "60px",
      mask: "radial-gradient(ellipse 100% 100% at center, black 60%, transparent 100%)",
    },
    background: {
      intensity: 0.06,
      dotSize: "1px",
      spacing: "60px",
      mask: "none",
    },
  },

  // Background gradients
  gradients: {
    // Main page background with red vignette
    page: `
      radial-gradient(1200px 700px at 30% 10%, rgba(255,60,60,0.18) 0%, rgba(0,0,0,0) 55%),
      radial-gradient(900px 600px at 80% 15%, rgba(255,90,60,0.10) 0%, rgba(0,0,0,0) 60%),
      linear-gradient(180deg, #07070A 0%, #050507 100%)
    `,
  },
} as const;
