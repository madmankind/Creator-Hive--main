'use client';

import * as React from 'react';
import { cn, cardHover, glassEffect } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant
   */
  variant?: 'default' | 'glass' | 'elevated' | 'flat';
  /**
   * Whether card should have hover animation
   */
  hoverable?: boolean;
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Whether card should be clickable (adds cursor pointer)
   */
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default',
    hoverable = false,
    padding = 'md',
    clickable = false,
    children,
    ...props 
  }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return cn(
            glassEffect('medium'),
            'shadow-glass'
          );
        case 'elevated':
          return [
            'bg-surface border border-border',
            'shadow-card',
          ].join(' ');
        case 'flat':
          return 'bg-surface border border-border';
        default:
          return [
            'bg-surface border border-border',
            'shadow-sm',
          ].join(' ');
      }
    };

    const getPaddingStyles = () => {
      switch (padding) {
        case 'none':
          return '';
        case 'sm':
          return 'p-4';
        case 'lg':
          return 'p-8';
        default:
          return 'p-6';
      }
    };

    return (
      <div
        className={cn(
          // Base styles
          'rounded-card',
          
          // Variant styles
          getVariantStyles(),
          
          // Padding
          getPaddingStyles(),
          
          // Interactive states
          hoverable && cardHover(),
          clickable && 'cursor-pointer',
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header - Optional header section with title and description
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-6 space-y-2', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * Card Title - Semantic title element
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-h2 font-semibold text-text', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * Card Description - Muted description text
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body text-muted', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * Card Content - Main content area
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-4', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

/**
 * Card Footer - Optional footer section
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-6 pt-6 border-t border-border', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};