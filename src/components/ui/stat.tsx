import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function Stat({ label, value, delta, className }: { label: string; value: string; delta?: number; className?: string }) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn("bg-[color:var(--color-card)] border border-[color:var(--color-border)] rounded-2xl p-5", className)}>
      <div className="text-sm text-[color:var(--color-muted-foreground)]">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {typeof delta === "number" && (
        <div className={cn("mt-2 inline-flex items-center gap-1 text-sm", positive ? "text-[color:var(--success)]" : "text-[color:var(--danger)]") }>
          {positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{positive ? "+" : ""}{delta.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}


