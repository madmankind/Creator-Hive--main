import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Enhanced className utility with Tailwind CSS class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Focus ring utility for consistent focus styles
 */
export function focusRing(variant: 'default' | 'accent' | 'danger' = 'default') {
  const baseClasses = "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2";
  
  switch (variant) {
    case 'accent':
      return `${baseClasses} focus-visible:outline-accent`;
    case 'danger':
      return `${baseClasses} focus-visible:outline-danger`;
    default:
      return `${baseClasses} focus-visible:outline-[color-mix(in_oklab,var(--accent),white_20%)]`;
  }
}

/**
 * Glass effect utility for backdrop blur components
 */
export function glassEffect(opacity: 'light' | 'medium' | 'heavy' = 'medium') {
  const baseClasses = "backdrop-blur-glass border border-border";
  
  switch (opacity) {
    case 'light':
      return `${baseClasses} bg-surface/20`;
    case 'heavy':
      return `${baseClasses} bg-surface/60`;
    default:
      return `${baseClasses} bg-surface/40`;
  }
}

/**
 * Card hover animation utility
 */
export function cardHover(enabled: boolean = true) {
  if (!enabled) return "";
  return "transition-all duration-[160ms] ease-out hover:scale-[1.01] hover:-translate-y-0.5";
}

/**
 * Responsive height utility for components
 */
export function responsiveHeight(component: 'input' | 'button' | 'toolbar') {
  switch (component) {
    case 'input':
      return "h-input md:h-input-desktop";
    case 'button':
      return "h-button md:h-button-desktop";
    case 'toolbar':
      return "h-toolbar";
    default:
      return "";
  }
}

/**
 * Format currency with localization
 */
export function formatCurrency(value: number, currency: string = "AED") {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency }).format(value);
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Debounce utility for search and input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
