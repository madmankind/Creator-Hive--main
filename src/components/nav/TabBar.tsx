'use client';

import * as React from 'react';
import { cn, focusRing } from '@/lib/utils';

export interface TabBarItem {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Display label
   */
  label: string;
  /**
   * Icon element (20px recommended)
   */
  icon: React.ReactNode;
  /**
   * Active icon variant (optional)
   */
  activeIcon?: React.ReactNode;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Navigation href (alternative to onClick)
   */
  href?: string;
  /**
   * Whether item is active
   */
  active?: boolean;
  /**
   * Whether item is disabled
   */
  disabled?: boolean;
  /**
   * Badge count (for notifications)
   */
  badge?: number;
}

export interface TabBarProps {
  /**
   * Tab items (max 5 recommended for mobile)
   */
  items: TabBarItem[];
  /**
   * Currently active item ID
   */
  activeId?: string;
  /**
   * Whether to show labels
   */
  showLabels?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TabBar - Mobile-first bottom navigation (375px optimized)
 * 5 slots reserved: Home, Jobs, Wallet, Messages, Profile
 */
const TabBar = React.forwardRef<HTMLElement, TabBarProps>(
  ({ 
    items,
    activeId,
    showLabels = true,
    className,
    ...props 
  }, ref) => {
    return (
      <nav
        ref={ref}
        role="tablist"
        className={cn(
          // Base styles - mobile-first
          'fixed bottom-0 left-0 right-0 z-30',
          'bg-surface border-t border-border',
          'safe-area-pb', // Safe area padding for notched devices
          
          // Glass effect
          'backdrop-blur-glass bg-surface/90',
          
          // Layout
          'flex items-stretch',
          'h-16 px-1', // 64px height with padding
          
          // Hide on desktop (optional - can be removed if needed on desktop)
          'md:hidden',
          
          className
        )}
        {...props}
      >
        {items.map((item) => {
          const isActive = item.active || item.id === activeId;
          const isDisabled = item.disabled;

          const content = (
            <>
              {/* Icon Container */}
              <div className="relative flex items-center justify-center w-5 h-5 mb-1">
                {/* Icon */}
                <div className={cn(
                  'transition-all duration-200',
                  isActive ? 'text-accent scale-110' : 'text-muted',
                  '[&>svg]:w-5 [&>svg]:h-5' // Ensure 20px icons
                )}>
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </div>

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-danger text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <span className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  'leading-none', // 11px label text
                  isActive ? 'text-accent' : 'text-muted'
                )}>
                  {item.label}
                </span>
              )}

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
              )}
            </>
          );

          const baseClasses = cn(
            // Layout
            'relative flex-1 flex flex-col items-center justify-center',
            'py-2 px-1', // Padding for touch targets
            'min-h-0', // Allow flex shrinking
            
            // Interactive states
            'transition-all duration-150',
            'select-none',
            
            // Disabled state
            isDisabled && 'opacity-50 pointer-events-none',
            
            // Focus styles
            focusRing(),
            
            // Hover state (for devices that support it)
            !isDisabled && !isActive && 'hover:bg-surface-2/50 active:bg-surface-2',
            
            // Touch optimization
            'touch-manipulation',
          );

          if (item.href && !isDisabled) {
            return (
              <a
                key={item.id}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                className={baseClasses}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              disabled={isDisabled}
              onClick={item.onClick}
              className={baseClasses}
            >
              {content}
            </button>
          );
        })}
      </nav>
    );
  }
);

TabBar.displayName = 'TabBar';

/**
 * Common tab bar configurations
 */
export const TabBarVariants = {
  /**
   * Creator Hive main navigation
   */
  CreatorHive: ({ 
    activeId,
    onNavigate,
    notifications = {},
    ...props 
  }: {
    activeId?: string;
    onNavigate?: (id: string) => void;
    notifications?: Record<string, number>;
  } & Omit<TabBarProps, 'items'>) => {
    const items: TabBarItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m3 0a1 1 0 001-1V10M9 21h6" />
          </svg>
        ),
        activeIcon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.47 3.84a.75.75 0 01.06 1.06L5.828 10.5H20a.75.75 0 010 1.5H5.828l5.704 5.64a.75.75 0 01-1.06 1.06l-7-6.93a.75.75 0 010-1.06l7-6.93a.75.75 0 011.06.06z"/>
          </svg>
        ),
        onClick: () => onNavigate?.('home'),
      },
      {
        id: 'jobs',
        label: 'Jobs',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        ),
        onClick: () => onNavigate?.('jobs'),
        badge: notifications.jobs,
      },
      {
        id: 'wallet',
        label: 'Wallet',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
        onClick: () => onNavigate?.('wallet'),
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        onClick: () => onNavigate?.('messages'),
        badge: notifications.messages,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
        onClick: () => onNavigate?.('profile'),
      },
    ];

    return (
      <TabBar
        items={items}
        activeId={activeId}
        {...props}
      />
    );
  },
} as const;

export { TabBar };