'use client';

import * as React from 'react';
import { cn, focusRing } from '@/lib/utils';

export interface SwitchProps
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
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    className,
    size = 'md',
    label,
    description,
    error = false,
    id,
    ...props 
  }, ref) => {
    const switchId = id || `switch-${React.useId()}`;

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            track: 'w-8 h-5',
            thumb: 'w-3 h-3',
            translate: 'translate-x-3',
          };
        case 'lg':
          return {
            track: 'w-14 h-8',
            thumb: 'w-6 h-6',
            translate: 'translate-x-6',
          };
        default:
          return {
            track: 'w-11 h-6',
            thumb: 'w-4 h-4',
            translate: 'translate-x-5',
          };
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

    const sizeStyles = getSizeStyles();

    return (
      <div className="flex items-start space-x-3">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className={cn(
              'sr-only peer',
              focusRing(),
              className
            )}
            {...props}
          />
          
          {/* Track */}
          <div
            className={cn(
              // Base styles
              'relative inline-flex items-center rounded-full',
              'transition-all duration-200 cursor-pointer',
              'border-2 border-transparent',
              
              // Size
              sizeStyles.track,
              
              // Default state
              'bg-surface border-border',
              'peer-hover:bg-surface-2',
              
              // Checked state
              'peer-checked:bg-accent',
              'peer-checked:hover:bg-accent/90',
              
              // Error state
              error && 'peer-checked:bg-danger',
              
              // Disabled state
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              'peer-disabled:hover:bg-surface peer-disabled:peer-checked:hover:bg-accent',
              
              // Focus styles (applied to track when input is focused)
              'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg'
            )}
          >
            {/* Thumb */}
            <div
              className={cn(
                // Base styles
                'absolute left-1 bg-white rounded-full shadow-sm',
                'transition-transform duration-200',
                
                // Size
                sizeStyles.thumb,
                
                // Checked position
                `peer-checked:${sizeStyles.translate}`,
                
                // Error state
                error && 'peer-checked:bg-white'
              )}
            />
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={switchId}
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

Switch.displayName = 'Switch';

export { Switch };