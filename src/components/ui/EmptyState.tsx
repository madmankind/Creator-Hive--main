'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  /**
   * Title text
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    loading?: boolean;
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    className,
    icon,
    title,
    description,
    action,
    secondaryAction,
    size = 'md',
    ...props 
  }, ref) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            container: 'py-8 px-4',
            icon: '[&>svg]:w-12 [&>svg]:h-12',
            title: 'text-h2',
            description: 'text-body max-w-sm',
            spacing: 'space-y-3',
          };
        case 'lg':
          return {
            container: 'py-16 px-6',
            icon: '[&>svg]:w-20 [&>svg]:h-20',
            title: 'text-h1',
            description: 'text-body max-w-lg',
            spacing: 'space-y-6',
          };
        default:
          return {
            container: 'py-12 px-6',
            icon: '[&>svg]:w-16 [&>svg]:h-16',
            title: 'text-h2',
            description: 'text-body max-w-md',
            spacing: 'space-y-4',
          };
      }
    };

    const sizeStyles = getSizeStyles();

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'flex flex-col items-center justify-center text-center',
          
          // Size styles
          sizeStyles.container,
          
          className
        )}
        {...props}
      >
        <div className={cn('flex flex-col items-center', sizeStyles.spacing)}>
          {/* Icon */}
          {icon && (
            <div className={cn(
              'text-muted flex-shrink-0',
              sizeStyles.icon
            )}>
              {icon}
            </div>
          )}

          {/* Content */}
          <div className={cn('space-y-2')}>
            <h3 className={cn(
              'font-semibold text-text',
              sizeStyles.title
            )}>
              {title}
            </h3>
            
            {description && (
              <p className={cn(
                'text-muted mx-auto',
                sizeStyles.description
              )}>
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {action && (
                <Button
                  variant={action.variant || 'primary'}
                  loading={action.loading}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
              
              {secondaryAction && (
                <Button
                  variant={secondaryAction.variant || 'ghost'}
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

/**
 * Common empty state icons and configurations
 */
export const EmptyStateVariants = {
  /**
   * No data found
   */
  NoData: (props: Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }) => (
    <EmptyState
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      }
      title={props.title || 'No data found'}
      {...props}
    />
  ),

  /**
   * Search results empty
   */
  NoResults: (props: Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }) => (
    <EmptyState
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      }
      title={props.title || 'No results found'}
      {...props}
    />
  ),

  /**
   * Error state
   */
  Error: (props: Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }) => (
    <EmptyState
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      }
      title={props.title || 'Something went wrong'}
      {...props}
    />
  ),

  /**
   * Coming soon state
   */
  ComingSoon: (props: Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }) => (
    <EmptyState
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      title={props.title || 'Coming soon'}
      {...props}
    />
  ),
} as const;

export { EmptyState };