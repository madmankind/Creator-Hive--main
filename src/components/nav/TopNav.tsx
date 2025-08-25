'use client';

import * as React from 'react';
import { cn, glassEffect, focusRing } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

export interface TopNavProps {
  /**
   * Brand/logo element
   */
  brand?: React.ReactNode;
  /**
   * Navigation items
   */
  items?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
  }>;
  /**
   * Actions on the right side
   */
  actions?: React.ReactNode;
  /**
   * Whether to show glass effect
   */
  glass?: boolean;
  /**
   * Whether to show bottom border
   */
  border?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TopNav - Desktop glass navigation bar with neon hairline
 */
const TopNav = React.forwardRef<HTMLElement, TopNavProps>(
  ({ 
    brand,
    items = [],
    actions,
    glass = true,
    border = true,
    className,
    ...props 
  }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          // Base styles
          'sticky top-0 z-40 w-full h-toolbar',
          'flex items-center justify-between px-6',
          
          // Glass effect
          glass && glassEffect('medium'),
          
          // Background fallback for non-glass
          !glass && 'bg-surface border-b border-border',
          
          className
        )}
        style={{
          // Neon bottom hairline gradient
          borderImage: border 
            ? 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 20%, rgba(6,182,212,0.6) 80%, transparent 100%) 1'
            : undefined,
          borderBottom: border ? '1px solid' : undefined,
        }}
        {...props}
      >
        {/* Brand */}
        {brand && (
          <div className="flex items-center flex-shrink-0">
            {brand}
          </div>
        )}

        {/* Navigation Items */}
        {items.length > 0 && (
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-2xl mx-8">
            {items.map((item, index) => {
              const isActive = item.active;
              const isDisabled = item.disabled;

              if (item.href) {
                return (
                  <a
                    key={`${item.label}-${index}`}
                    href={item.href}
                    className={cn(
                      // Base styles
                      'relative px-4 py-2 text-body font-medium rounded-button',
                      'transition-all duration-150',
                      
                      // States
                      isActive 
                        ? 'text-text bg-surface-2' 
                        : 'text-muted hover:text-text hover:bg-surface/50',
                      
                      isDisabled && 'opacity-50 pointer-events-none',
                      
                      // Focus styles
                      focusRing()
                    )}
                  >
                    {item.label}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                    )}
                  </a>
                );
              }

              return (
                <button
                  key={`${item.label}-${index}`}
                  onClick={item.onClick}
                  disabled={isDisabled}
                  className={cn(
                    // Base styles
                    'relative px-4 py-2 text-body font-medium rounded-button',
                    'transition-all duration-150',
                    
                    // States
                    isActive 
                      ? 'text-text bg-surface-2' 
                      : 'text-muted hover:text-text hover:bg-surface/50',
                    
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    
                    // Focus styles
                    focusRing()
                  )}
                >
                  {item.label}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </nav>
    );
  }
);

TopNav.displayName = 'TopNav';

/**
 * TopNav variants for common use cases
 */
export const TopNavVariants = {
  /**
   * Marketing site navigation
   */
  Marketing: ({ 
    brand, 
    navItems = [],
    showAuth = true,
    onSignIn,
    onSignUp,
    ...props 
  }: {
    brand?: React.ReactNode;
    navItems?: Array<{ label: string; href: string; active?: boolean }>;
    showAuth?: boolean;
    onSignIn?: () => void;
    onSignUp?: () => void;
  } & Omit<TopNavProps, 'items' | 'actions'>) => (
    <TopNav
      brand={brand}
      items={navItems}
      actions={
        showAuth ? (
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onSignIn}>
              Sign In
            </Button>
            <Button variant="primary" onClick={onSignUp}>
              Sign Up
            </Button>
          </div>
        ) : undefined
      }
      {...props}
    />
  ),

  /**
   * Dashboard navigation
   */
  Dashboard: ({ 
    brand,
    user,
    notifications,
    onNotificationClick,
    onProfileClick,
    onMenuClick,
    ...props 
  }: {
    brand?: React.ReactNode;
    user?: { name: string; avatar?: string };
    notifications?: number;
    onNotificationClick?: () => void;
    onProfileClick?: () => void;
    onMenuClick?: () => void;
  } & Omit<TopNavProps, 'items' | 'actions'>) => (
    <TopNav
      brand={brand}
      actions={
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <IconButton
            variant="ghost"
            size="md"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden"
          />

          {/* Notifications */}
          {onNotificationClick && (
            <div className="relative">
              <IconButton
                variant="ghost"
                size="md"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 9.75 4.5c0 1.33-.4 2.57-1.09 3.6L12 18.75l-7.16-7.35A5.99 5.99 0 0 1 3.75 7.5a6 6 0 0 1 6.75-6z" />
                  </svg>
                }
                onClick={onNotificationClick}
                aria-label="Notifications"
              />
              {notifications && notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {notifications > 99 ? '99+' : notifications}
                </div>
              )}
            </div>
          )}

          {/* User profile */}
          {user && (
            <button
              onClick={onProfileClick}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-button',
                'text-text hover:bg-surface/50 transition-colors duration-150',
                focusRing()
              )}
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden md:block text-body font-medium">
                {user.name}
              </span>
            </button>
          )}
        </div>
      }
      {...props}
    />
  ),
} as const;

export { TopNav };