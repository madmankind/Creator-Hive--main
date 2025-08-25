'use client';

import * as React from 'react';
import { cn, focusRing } from '@/lib/utils';

export interface SegmentedOption {
  /**
   * Unique value for this option
   */
  value: string;
  /**
   * Display label
   */
  label: string;
  /**
   * Optional icon
   */
  icon?: React.ReactNode;
  /**
   * Whether option is disabled
   */
  disabled?: boolean;
}

export interface SegmentedProps {
  /**
   * Available options
   */
  options: SegmentedOption[];
  /**
   * Current selected value
   */
  value: string;
  /**
   * Callback when value changes
   */
  onValueChange: (value: string) => void;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to take full width
   */
  fullWidth?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Segmented Control - iOS-style segmented picker
 */
const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  ({ 
    options,
    value,
    onValueChange,
    size = 'md',
    fullWidth = false,
    className,
    ...props 
  }, ref) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            container: 'p-1',
            option: 'px-3 py-1.5 text-label',
          };
        case 'lg':
          return {
            container: 'p-1.5',
            option: 'px-6 py-3 text-body',
          };
        default:
          return {
            container: 'p-1',
            option: 'px-4 py-2 text-body',
          };
      }
    };

    const sizeStyles = getSizeStyles();

    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          // Base styles
          'inline-flex bg-surface border border-border rounded-input',
          
          // Size styles
          sizeStyles.container,
          
          // Full width
          fullWidth && 'w-full',
          
          className
        )}
        {...props}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isDisabled = option.disabled;

          return (
            <button
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => !isDisabled && onValueChange(option.value)}
              className={cn(
                // Base styles
                'relative inline-flex items-center justify-center',
                'font-medium transition-all duration-150',
                'rounded-button select-none whitespace-nowrap',
                
                // Size styles
                sizeStyles.option,
                
                // Full width
                fullWidth && 'flex-1',
                
                // Selected state
                isSelected 
                  ? 'bg-accent text-white shadow-sm z-10' 
                  : 'text-muted hover:text-text hover:bg-surface-2',
                
                // Disabled state
                isDisabled && 'opacity-50 cursor-not-allowed hover:text-muted hover:bg-transparent',
                
                // Focus styles
                focusRing(),
                
                // Spacing adjustments
                index > 0 && '-ml-px'
              )}
            >
              {option.icon && (
                <span className={cn(
                  'flex-shrink-0',
                  option.label && 'mr-2'
                )}>
                  {option.icon}
                </span>
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);

Segmented.displayName = 'Segmented';

export { Segmented };