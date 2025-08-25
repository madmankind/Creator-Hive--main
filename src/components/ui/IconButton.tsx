'use client';

import * as React from 'react';
import { cn, focusRing } from '@/lib/utils';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon element (usually from lucide-react)
   */
  icon: React.ReactNode;
  /**
   * Accessible label for screen readers
   */
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    loading = false,
    icon,
    disabled,
    ...props 
  }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return [
            'bg-accent text-white',
            'hover:bg-accent/90 active:bg-accent/80',
            'border border-accent/20',
            'shadow-sm',
          ].join(' ');
        case 'secondary':
          return [
            'bg-surface text-text border border-border',
            'hover:bg-surface-2 active:bg-surface',
            'shadow-sm',
          ].join(' ');
        case 'ghost':
          return [
            'bg-transparent text-muted border border-transparent',
            'hover:text-text hover:bg-surface/50 active:bg-surface/80',
          ].join(' ');
        case 'danger':
          return [
            'bg-danger text-white',
            'hover:bg-danger/90 active:bg-danger/80',
            'border border-danger/20',
            'shadow-sm',
          ].join(' ');
        default:
          return [
            'bg-surface text-text border border-border',
            'hover:bg-surface-2 active:bg-surface',
            'shadow-sm',
          ].join(' ');
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'w-8 h-8 rounded-md [&>svg]:w-4 [&>svg]:h-4';
        case 'lg':
          return 'w-12 h-12 rounded-button [&>svg]:w-6 [&>svg]:h-6';
        default:
          return 'w-10 h-10 rounded-button [&>svg]:w-5 [&>svg]:h-5';
      }
    };

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium transition-all duration-150',
          'select-none shrink-0',
          
          // Size styles
          getSizeStyles(),
          
          // Variant styles  
          getVariantStyles(),
          
          // Disabled state
          isDisabled && [
            'opacity-50 cursor-not-allowed',
            'hover:bg-current active:bg-current',
          ].join(' '),
          
          // Focus styles
          focusRing(),
          
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };