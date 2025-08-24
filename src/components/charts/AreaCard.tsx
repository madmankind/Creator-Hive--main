"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TiltCard } from "@/components/primitives/TiltCard";

export function AreaCard({ data, title }: { data: Array<{ name: string; value: number }>; title: string }) {
  return (
    <TiltCard elevation="hover" className="p-4">
      <div className="text-sm text-[color:var(--text-secondary)]">{title}</div>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "rgba(17,23,41,0.7)", backdropFilter: "blur(12px)", border: "1px solid var(--border)" }} />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="url(#area)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </TiltCard>
  );
}

