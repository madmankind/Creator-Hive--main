import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Plus } from 'lucide-react';

export interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'default' | 'large';
}

const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ children, icon = <Plus className="h-5 w-5" />, size = 'default', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'fixed bottom-20 right-4 z-50 flex items-center justify-center',
          'bg-accent hover:bg-accent/90 text-white',
          'rounded-full shadow-lg hover:shadow-xl',
          'transition-all duration-200',
          'focus-ring',
          size === 'default' ? 'h-14 w-14' : '',
          size === 'large' && children ? 'h-14 px-6 gap-2' : '',
          size === 'large' && !children ? 'h-16 w-16' : '',
          className
        )}
        {...props}
      >
        {icon}
        {children && <span className="font-medium">{children}</span>}
      </button>
    );
  }
);

FAB.displayName = 'FAB';

export { FAB };