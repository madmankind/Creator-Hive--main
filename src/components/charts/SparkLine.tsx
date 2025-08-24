"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

export function SparkLine({ data }: { data: Array<{ value: number }> }) {
  return (
    <div className="h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
          <Tooltip contentStyle={{ background: "rgba(17,23,41,0.7)", backdropFilter: "blur(12px)", border: "1px solid var(--border)" }} cursor={false} />
          <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

