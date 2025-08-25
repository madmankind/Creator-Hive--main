'use client';

import * as React from 'react';
import { cn, focusRing, responsiveHeight } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual variant
   */
  variant?: 'default' | 'ghost';
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Success state  
   */
  success?: boolean;
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;
  /**
   * Label text
   */
  label?: string;
  /**
   * Helper text below input
   */
  helperText?: string;
  /**
   * Error message (overrides helperText when error=true)
   */
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    error = false,
    success = false,
    leftIcon,
    rightIcon,
    label,
    helperText,
    errorMessage,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
  const inputId = id || `input-${generatedId}`;

    const getVariantStyles = () => {
      switch (variant) {
        case 'ghost':
          return [
            'bg-transparent border-transparent',
            'hover:bg-surface/30 focus:bg-surface/50',
            'focus:border-border',
          ].join(' ');
        default:
          return [
            'bg-surface border-border',
            'hover:border-border/60 focus:border-accent/50',
          ].join(' ');
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'h-8 px-3 text-label rounded-input';
        case 'lg':
          return 'h-12 px-4 text-body rounded-input';
        default:
          return `${responsiveHeight('input')} px-4 text-body rounded-input`;
      }
    };

    const getStateStyles = () => {
      if (error) {
        return 'border-danger/60 focus:border-danger text-danger placeholder:text-danger/60';
      }
      if (success) {
        return 'border-success/60 focus:border-success';
      }
      return '';
    };

    const displayHelperText = error ? errorMessage : helperText;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-label text-text mb-2 font-medium"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              // Base styles
              'w-full border transition-all duration-150',
              'text-text placeholder:text-muted',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              
              // Size styles
              getSizeStyles(),
              
              // Variant styles
              getVariantStyles(),
              
              // State styles
              getStateStyles(),
              
              // Icon padding adjustments
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              // Focus styles
              focusRing(),
              
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {displayHelperText && (
          <p className={cn(
            'mt-2 text-label',
            error ? 'text-danger' : 'text-muted'
          )}>
            {displayHelperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };