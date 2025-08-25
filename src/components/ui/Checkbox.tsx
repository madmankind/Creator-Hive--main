'use client';

import * as React from 'react';
import { cn, focusRing } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Label text
   */
  label?: string;
  /**
   * Description text below label
   */
  description?: string;
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Indeterminate state
   */
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className,
    size = 'md',
    label,
    description,
    error = false,
    indeterminate = false,
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${React.useId()}`;
    
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => checkboxRef.current!);
    
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'w-4 h-4';
        case 'lg':
          return 'w-6 h-6';
        default:
          return 'w-5 h-5';
      }
    };

    const getLabelSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'text-label';
        case 'lg':
          return 'text-body';
        default:
          return 'text-body';
      }
    };

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center justify-center">
          <input
            ref={checkboxRef}
            type="checkbox"
            id={checkboxId}
            className={cn(
              // Base styles
              'appearance-none border rounded-md',
              'transition-all duration-150',
              'cursor-pointer disabled:cursor-not-allowed',
              
              // Size
              getSizeStyles(),
              
              // Default state
              'bg-surface border-border',
              'hover:border-accent/50',
              
              // Checked state
              'checked:bg-accent checked:border-accent',
              'checked:hover:bg-accent/90',
              
              // Error state
              error && 'border-danger checked:bg-danger checked:border-danger',
              
              // Disabled state
              'disabled:opacity-50 disabled:hover:border-border',
              
              // Focus styles
              focusRing(),
              
              className
            )}
            {...props}
          />
          
          {/* Checkmark icon */}
          <svg
            className={cn(
              'absolute pointer-events-none',
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5',
              'text-white opacity-0',
              'peer-checked:opacity-100 transition-opacity duration-150'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          
          {/* Indeterminate icon */}
          {indeterminate && (
            <svg
              className={cn(
                'absolute pointer-events-none',
                size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5',
                'text-white'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 12H4"
              />
            </svg>
          )}
        </div>
        
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'block font-medium cursor-pointer',
                  getLabelSizeStyles(),
                  error ? 'text-danger' : 'text-text'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-label text-muted mt-1',
                error && 'text-danger/80'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };