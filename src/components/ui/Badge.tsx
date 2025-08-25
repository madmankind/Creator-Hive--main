'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant
   */
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether badge has a dot indicator
   */
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'accent':
          return 'bg-accent/10 text-accent border-accent/20';
        case 'success':
          return 'bg-success/10 text-success border-success/20';
        case 'warning':
          return 'bg-warning/10 text-warning border-warning/20';
        case 'danger':
          return 'bg-danger/10 text-danger border-danger/20';
        case 'outline':
          return 'bg-transparent text-text border-border';
        default:
          return 'bg-surface text-muted border-border';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'px-2 py-0.5 text-xs rounded-md';
        case 'lg':
          return 'px-4 py-2 text-body rounded-lg';
        default:
          return 'px-3 py-1 text-label rounded-input';
      }
    };

    const getDotColor = () => {
      switch (variant) {
        case 'accent':
          return 'bg-accent';
        case 'success':
          return 'bg-success';
        case 'warning':
          return 'bg-warning';
        case 'danger':
          return 'bg-danger';
        default:
          return 'bg-muted';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-medium border',
          'select-none whitespace-nowrap',
          
          // Size styles
          getSizeStyles(),
          
          // Variant styles
          getVariantStyles(),
          
          className
        )}
        {...props}
      >
        {dot && (
          <div className={cn(
            'w-2 h-2 rounded-full mr-2 flex-shrink-0',
            getDotColor()
          )} />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };