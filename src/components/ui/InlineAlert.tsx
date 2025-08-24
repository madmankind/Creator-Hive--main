import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const alertVariants = cva(
  'flex items-center gap-3 p-4 rounded-lg border text-sm',
  {
    variants: {
      variant: {
        default: 'bg-surface border-border text-text',
        success: 'bg-success/10 border-success/20 text-success',
        warning: 'bg-warn/10 border-warn/20 text-warn',
        danger: 'bg-danger/10 border-danger/20 text-danger',
        info: 'bg-accent-2/10 border-accent-2/20 text-accent-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
};

export interface InlineAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  children: React.ReactNode;
  showIcon?: boolean;
}

export function InlineAlert({
  children,
  variant = 'default',
  showIcon = true,
  className,
  ...props
}: InlineAlertProps) {
  const Icon = iconMap[variant || 'default'];

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      {showIcon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <div className="flex-1">{children}</div>
    </div>
  );
}