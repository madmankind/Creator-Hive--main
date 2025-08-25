'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode;
  /**
   * Tooltip position relative to trigger
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Alignment of tooltip relative to trigger
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Delay before showing tooltip (ms)
   */
  delayDuration?: number;
  /**
   * Whether tooltip is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes for tooltip
   */
  className?: string;
  /**
   * Trigger element
   */
  children: React.ReactNode;
}

/**
 * Tooltip - Contextual information overlay
 */
const Tooltip = ({
  content,
  side = 'top',
  align = 'center',
  delayDuration = 500,
  disabled = false,
  className,
  children,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = React.useCallback(() => {
    if (disabled || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let x = 0;
    let y = 0;

    // Calculate position based on side
    switch (side) {
      case 'top':
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        x = triggerRect.right + 8;
        break;
    }

    // Calculate alignment
    if (side === 'top' || side === 'bottom') {
      switch (align) {
        case 'start':
          x = triggerRect.left;
          break;
        case 'end':
          x = triggerRect.right - tooltipRect.width;
          break;
        default:
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      }
    } else {
      switch (align) {
        case 'start':
          y = triggerRect.top;
          break;
        case 'end':
          y = triggerRect.bottom - tooltipRect.height;
          break;
        default:
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      }
    }

    // Keep tooltip within viewport
    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

    setPosition({ x, y });
    setIsVisible(true);
  }, [side, align, disabled]);

  const hideTooltip = React.useCallback(() => {
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(showTooltip, delayDuration);
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleFocus = () => {
    timeoutRef.current = setTimeout(showTooltip, delayDuration);
  };

  const handleBlur = () => {
    hideTooltip();
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowStyles = () => {
    const arrowSize = 6;
    const base = 'absolute w-0 h-0 border-solid';
    
    switch (side) {
      case 'top':
        return {
          className: `${base} border-t-surface border-l-transparent border-r-transparent border-b-0`,
          style: {
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          },
        };
      case 'bottom':
        return {
          className: `${base} border-b-surface border-l-transparent border-r-transparent border-t-0`,
          style: {
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          },
        };
      case 'left':
        return {
          className: `${base} border-l-surface border-t-transparent border-b-transparent border-r-0`,
          style: {
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          },
        };
      case 'right':
        return {
          className: `${base} border-r-surface border-t-transparent border-b-transparent border-l-0`,
          style: {
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          },
        };
      default:
        return { className: '', style: {} };
    }
  };

  const arrowStyles = getArrowStyles();

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
      >
        {children}
      </div>

      {/* Portal for tooltip */}
      {typeof document !== 'undefined' && (
        <div>
          <div
            ref={tooltipRef}
            role="tooltip"
            className={cn(
              // Base styles
              'fixed z-50 px-3 py-2 text-label',
              'bg-surface border border-border rounded-input shadow-lg',
              'pointer-events-none select-none',
              
              // Visibility and animation
              isVisible 
                ? 'opacity-100 animate-fade-in' 
                : 'opacity-0 pointer-events-none',
              
              className
            )}
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {content}
            
            {/* Arrow */}
            <div
              className={arrowStyles.className}
              style={arrowStyles.style}
            />
          </div>
        </div>
      )}
    </>
  );
};

export { Tooltip };