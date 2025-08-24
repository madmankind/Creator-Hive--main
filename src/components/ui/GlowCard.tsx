import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlowCard.displayName = 'GlowCard';

export { GlowCard };