'use client';

import * as React from 'react';
import { cn, focusRing } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  /**
   * Current active tab value
   */
  value: string;
  /**
   * Callback when tab changes
   */
  onValueChange: (value: string) => void;
  /**
   * Layout orientation
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Child components
   */
  children: React.ReactNode;
}

/**
 * Tabs Root - Container for the tab system
 */
const Tabs = ({ value, onValueChange, orientation = 'horizontal', className, children }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange, orientation }}>
      <div 
        className={cn(
          orientation === 'vertical' ? 'flex' : 'space-y-4',
          className
        )}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant
   */
  variant?: 'default' | 'pills' | 'underline';
}

/**
 * Tabs List - Container for tab triggers
 */
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsList must be used within Tabs');

    const { orientation } = context;

    const getVariantStyles = () => {
      switch (variant) {
        case 'pills':
          return 'bg-surface p-1 rounded-input';
        case 'underline':
          return 'border-b border-border';
        default:
          return 'bg-surface p-1 rounded-input';
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          
          // Orientation
          orientation === 'vertical' ? 'flex-col h-fit' : 'w-full',
          
          // Variant styles
          getVariantStyles(),
          
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Unique value for this tab
   */
  value: string;
}

/**
 * Tabs Trigger - Individual tab button
 */
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const { value: selectedValue, onValueChange } = context;
    const isActive = selectedValue === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        onClick={() => onValueChange(value)}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center whitespace-nowrap',
          'px-4 py-2 text-body font-medium transition-all duration-150',
          'disabled:pointer-events-none disabled:opacity-50',
          'rounded-button',
          
          // Active/Inactive states
          isActive 
            ? 'bg-accent text-white shadow-sm' 
            : 'text-muted hover:text-text hover:bg-surface-2',
          
          // Focus styles
          focusRing(),
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Unique value for this content panel
   */
  value: string;
}

/**
 * Tabs Content - Content panel for each tab
 */
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    const { value: selectedValue } = context;
    const isActive = selectedValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'animate-fade-in',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };