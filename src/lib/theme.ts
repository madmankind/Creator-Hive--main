/**
 * Creator Hive Design System - Theme Tokens
 * Fey-inspired dark theme with soft neon gradients
 */

export const colors = {
  // Core colors
  bg: '#0b0f17',
  surface: '#111827',
  surface2: '#0f172a',
  text: '#e8ebf3',
  muted: '#a3adba',
  border: 'rgba(255,255,255,0.10)',
  
  // Accent colors
  accent: '#8b5cf6',
  accent2: '#06b6d4',
  
  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

export const spacing = {
  1: '4px',
  2: '8px', 
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
  },
  fontSize: {
    display: 'clamp(2rem, 5vw, 2.5rem)',
    h1: 'clamp(1.5rem, 4vw, 1.75rem)', 
    h2: 'clamp(1.125rem, 3vw, 1.25rem)',
    body: '0.875rem',
    label: '0.75rem',
    mono: '0.75rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    display: '1.1',
    h1: '1.2',
    h2: '1.3', 
    body: '1.43',
    label: '1.5',
  },
} as const;

export const components = {
  heights: {
    toolbar: '56px',
    input: '44px',
    inputDesktop: '40px',
    button: '44px', 
    buttonDesktop: '40px',
  },
  borderRadius: {
    card: '12px',
    input: '10px',
    button: '10px',
  },
  shadows: {
    focus: '0 0 0 2px color-mix(in oklab, var(--accent), white 20%)',
    card: '0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border)',
    cardHover: '0 8px 32px rgba(0, 0, 0, 0.18), 0 0 0 1px var(--border)',
    glass: '0 0 0 1px var(--border), 0 2px 16px rgba(0, 0, 0, 0.1)',
  },
} as const;

export const gradients = {
  // Backdrop gradient layers
  backdrop: [
    'radial-gradient(60% 50% at 50% 20%, rgba(139,92,246,0.25), transparent 60%)',
    'radial-gradient(40% 35% at 80% 10%, rgba(6,182,212,0.25), transparent 60%)',
    'radial-gradient(30% 25% at 20% 80%, rgba(255,255,255,0.05), transparent 60%)',
    'linear-gradient(180deg, #0b0f17 0%, #0b0f17 100%)',
  ].join(', '),
  
  // Accent gradients
  primary: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  accent: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  neon: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  backdrop: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
} as const;

// Utility functions
export const focusRing = () => ({
  outline: '2px solid color-mix(in oklab, var(--accent), white 20%)',
  outlineOffset: '2px',
});

export const glassEffect = () => ({
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid var(--border)',
});

export const cardHover = () => ({
  transition: 'all 160ms ease-out',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.01)',
  },
});

// Theme object for easy consumption
export const theme = {
  colors,
  spacing,
  typography,
  components,
  gradients,
  breakpoints,
  zIndex,
  utils: {
    focusRing,
    glassEffect,
    cardHover,
  },
} as const;

export default theme;