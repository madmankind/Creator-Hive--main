import { cn } from "@/lib/utils";

export function Badge({ variant = "default", children }: { variant?: "default" | "success" | "warning" | "danger"; children: React.ReactNode }) {
  const colorByVariant: Record<string, string> = {
    default: "bg-[color:var(--grey-800)] text-[color:var(--text)]",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    danger: "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", colorByVariant[variant])}>
      {children}
    </span>
  );
}


