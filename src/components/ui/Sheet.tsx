'use client';

import * as React from 'react';
import { cn, focusRing, glassEffect } from '@/lib/utils';

export interface SheetProps {
  /**
   * Whether sheet is open
   */
  open: boolean;
  /**
   * Callback when sheet should close
   */
  onClose: () => void;
  /**
   * Position of the sheet
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Size of the sheet
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Whether to show backdrop overlay
   */
  backdrop?: boolean;
  /**
   * Whether clicking backdrop closes sheet
   */
  closeOnBackdropClick?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Sheet content
   */
  children: React.ReactNode;
}

/**
 * Sheet - Slide-out panel component
 */
const Sheet = ({
  open,
  onClose,
  side = 'right',
  size = 'md',
  backdrop = true,
  closeOnBackdropClick = true,
  className,
  children,
}: SheetProps) => {
  const sheetRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus trap
  React.useEffect(() => {
    if (!open || !sheetRef.current) return;

    const focusableElements = sheetRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [open]);

  const getSideStyles = () => {
    switch (side) {
      case 'top':
        return {
          transform: open ? 'translateY(0)' : 'translateY(-100%)',
          top: 0,
          left: 0,
          right: 0,
          height: getSizeValue(),
        };
      case 'bottom':
        return {
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          bottom: 0,
          left: 0,
          right: 0,
          height: getSizeValue(),
        };
      case 'left':
        return {
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          top: 0,
          left: 0,
          bottom: 0,
          width: getSizeValue(),
        };
      default: // right
        return {
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          top: 0,
          right: 0,
          bottom: 0,
          width: getSizeValue(),
        };
    }
  };

  const getSizeValue = () => {
    switch (size) {
      case 'sm':
        return side === 'top' || side === 'bottom' ? '25vh' : '320px';
      case 'lg':
        return side === 'top' || side === 'bottom' ? '75vh' : '640px';
      case 'xl':
        return side === 'top' || side === 'bottom' ? '85vh' : '768px';
      case 'full':
        return '100%';
      default:
        return side === 'top' || side === 'bottom' ? '50vh' : '480px';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeOnBackdropClick ? onClose : undefined}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          // Base styles
          'absolute bg-surface border-border',
          'shadow-2xl transition-transform duration-300 ease-out',
          
          // Glass effect
          glassEffect('heavy'),
          
          className
        )}
        style={getSideStyles()}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Sheet Header - Header section with title and close button
 */
const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, onClose, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between p-6 border-b border-border',
      className
    )}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {onClose && (
      <button
        onClick={onClose}
        className={cn(
          'ml-4 p-2 rounded-button text-muted hover:text-text',
          'hover:bg-surface-2 transition-colors duration-150',
          focusRing()
        )}
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
));
SheetHeader.displayName = 'SheetHeader';

/**
 * Sheet Title - Title text for the sheet
 */
const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-h2 font-semibold text-text', className)}
    {...props}
  />
));
SheetTitle.displayName = 'SheetTitle';

/**
 * Sheet Description - Description text for the sheet
 */
const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body text-muted mt-2', className)}
    {...props}
  />
));
SheetDescription.displayName = 'SheetDescription';

/**
 * Sheet Content - Main content area
 */
const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 p-6 overflow-y-auto', className)}
    {...props}
  />
));
SheetContent.displayName = 'SheetContent';

/**
 * Sheet Footer - Footer section with actions
 */
const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end space-x-3 p-6',
      'border-t border-border',
      className
    )}
    {...props}
  />
));
SheetFooter.displayName = 'SheetFooter';

export { 
  Sheet, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetContent, 
  SheetFooter 
};