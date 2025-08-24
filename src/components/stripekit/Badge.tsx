import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-text border border-border',
        success: 'bg-success/10 text-success border border-success/20',
        warning: 'bg-warn/10 text-warn border border-warn/20',
        danger: 'bg-danger/10 text-danger border border-danger/20',
        info: 'bg-accent-2/10 text-accent-2 border border-accent-2/20',
        accent: 'bg-accent/10 text-accent border border-accent/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}