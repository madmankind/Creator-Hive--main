'use client';

import * as React from 'react';
import { cn, focusRing, responsiveHeight } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /**
   * Size variant affecting height and padding
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether button should take full width
   */
  fullWidth?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon to display (usually from lucide-react)
   */
  icon?: React.ReactNode;
  /**
   * Icon position relative to children
   */
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md',
    fullWidth = false,
    loading = false,
    icon,
    iconPosition = 'left',
    children,
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
            'bg-transparent text-text border border-transparent',
            'hover:bg-surface/50 active:bg-surface/80',
          ].join(' ');
        case 'danger':
          return [
            'bg-danger text-white',
            'hover:bg-danger/90 active:bg-danger/80',
            'border border-danger/20',
            'shadow-sm',
          ].join(' ');
        default:
          return '';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'h-8 px-3 text-label rounded-input';
        case 'lg':
          return 'h-12 px-6 text-body rounded-button';
        default:
          return `${responsiveHeight('button')} px-4 text-body rounded-button`;
      }
    };

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium transition-all duration-150',
          'select-none whitespace-nowrap',
          
          // Size styles
          getSizeStyles(),
          
          // Variant styles  
          getVariantStyles(),
          
          // Full width
          fullWidth && 'w-full',
          
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
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2 flex-shrink-0">{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2 flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };