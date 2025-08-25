'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of skeleton (CSS value)
   */
  width?: string | number;
  /**
   * Height of skeleton (CSS value)
   */
  height?: string | number;
  /**
   * Whether skeleton is circular
   */
  circular?: boolean;
  /**
   * Animation variant
   */
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className,
    width,
    height,
    circular = false,
    animation = 'pulse',
    style,
    ...props 
  }, ref) => {
    const getAnimationStyles = () => {
      switch (animation) {
        case 'wave':
          return 'animate-pulse bg-gradient-to-r from-surface via-surface-2 to-surface bg-[length:200%_100%] animate-[wave_2s_ease-in-out_infinite]';
        case 'none':
          return 'bg-surface';
        default:
          return 'animate-pulse bg-surface';
      }
    };

    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'inline-block',
          
          // Shape
          circular ? 'rounded-full' : 'rounded-input',
          
          // Animation
          getAnimationStyles(),
          
          className
        )}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton variants for common use cases
 */
export const SkeletonVariants = {
  /**
   * Text line skeleton
   */
  Text: ({ lines = 1, className, ...props }: { lines?: number } & Omit<SkeletonProps, 'height'>) => (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i}
          height="1rem"
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
          {...props}
        />
      ))}
    </div>
  ),

  /**
   * Avatar skeleton
   */
  Avatar: ({ size = 'md', ...props }: { size?: 'sm' | 'md' | 'lg' } & Omit<SkeletonProps, 'width' | 'height' | 'circular'>) => {
    const sizeMap = {
      sm: 32,
      md: 40,
      lg: 56,
    };
    
    return (
      <Skeleton 
        width={sizeMap[size]}
        height={sizeMap[size]}
        circular
        {...props}
      />
    );
  },

  /**
   * Card skeleton
   */
  Card: ({ className, ...props }: SkeletonProps) => (
    <div className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <SkeletonVariants.Avatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton height="1rem" width="40%" />
          <Skeleton height="0.875rem" width="60%" />
        </div>
      </div>
      <SkeletonVariants.Text lines={3} />
      <div className="flex space-x-2">
        <Skeleton height="2rem" width="5rem" />
        <Skeleton height="2rem" width="4rem" />
      </div>
    </div>
  ),

  /**
   * Button skeleton
   */
  Button: ({ size = 'md', ...props }: { size?: 'sm' | 'md' | 'lg' } & Omit<SkeletonProps, 'width' | 'height'>) => {
    const sizeMap = {
      sm: { height: '2rem', width: '4rem' },
      md: { height: '2.5rem', width: '5rem' },
      lg: { height: '3rem', width: '6rem' },
    };
    
    return (
      <Skeleton 
        height={sizeMap[size].height}
        width={sizeMap[size].width}
        {...props}
      />
    );
  },

  /**
   * Input skeleton
   */
  Input: ({ ...props }: Omit<SkeletonProps, 'height'>) => (
    <div className="space-y-2">
      <Skeleton height="0.875rem" width="25%" />
      <Skeleton height="2.75rem" width="100%" />
    </div>
  ),
} as const;

export { Skeleton };