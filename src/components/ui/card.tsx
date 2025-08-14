import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "bg-[color:var(--color-card)] card-glow border border-[color:var(--color-border)] rounded-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>;
}


