'use client';

import * as React from 'react';
import { cn, focusRing, responsiveHeight } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Visual variant
   */
  variant?: 'default' | 'ghost';
  /**
   * Size variant
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
   * Label text
   */
  label?: string;
  /**
   * Helper text below select
   */
  helperText?: string;
  /**
   * Error message (overrides helperText when error=true)
   */
  errorMessage?: string;
  /**
   * Placeholder text for empty state
   */
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    error = false,
    success = false,
    label,
    helperText,
    errorMessage,
    placeholder = 'Select an option...',
    id,
    children,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
  const selectId = id || `select-${generatedId}`;

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
          return 'h-8 px-3 pr-8 text-label rounded-input';
        case 'lg':
          return 'h-12 px-4 pr-10 text-body rounded-input';
        default:
          return `${responsiveHeight('input')} px-4 pr-10 text-body rounded-input`;
      }
    };

    const getStateStyles = () => {
      if (error) {
        return 'border-danger/60 focus:border-danger text-danger';
      }
      if (success) {
        return 'border-success/60 focus:border-success';
      }
      return '';
    };

    const getChevronSize = () => {
      switch (size) {
        case 'sm':
          return 'w-4 h-4 right-2';
        case 'lg':
          return 'w-5 h-5 right-3';
        default:
          return 'w-4 h-4 right-3';
      }
    };

    const displayHelperText = error ? errorMessage : helperText;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-label text-text mb-2 font-medium"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              // Base styles
              'w-full border transition-all duration-150',
              'text-text appearance-none cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              
              // Size styles
              getSizeStyles(),
              
              // Variant styles
              getVariantStyles(),
              
              // State styles
              getStateStyles(),
              
              // Focus styles
              focusRing(),
              
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          
          {/* Chevron Down Icon */}
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none',
            'text-muted',
            getChevronSize()
          )}>
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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

Select.displayName = 'Select';

export { Select };