import { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="text-center border border-[color:var(--color-border)] rounded-2xl p-10 bg-[color:var(--grey-900)]">
      <div className="text-lg font-medium">{title}</div>
      {description && <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}


