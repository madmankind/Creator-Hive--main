"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { AreaCard } from "@/components/charts/AreaCard";

type Metric = { date: string; revenue: number; bookings: number };

export default function DashboardClient() {
  const { data, error, isLoading } = useSWR<Metric[]>("/api/metrics", fetcher);

  const totals = (data ?? []).reduce(
    (acc, cur) => {
      acc.revenue += cur.revenue;
      acc.bookings += cur.bookings;
      return acc;
    },
    { revenue: 0, bookings: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-4">
          <div className="text-sm text-neutral-400">Revenue (period)</div>
          <div className="text-2xl font-semibold">${totals.revenue.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-4">
          <div className="text-sm text-neutral-400">Bookings</div>
          <div className="text-2xl font-semibold">{totals.bookings}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-4">
        {isLoading && <div className="animate-pulse text-neutral-400">Loading chart…</div>}
        {error && <div className="text-rose-300">Failed to load metrics.</div>}
        {data && <AreaCard data={data.map((d) => ({ name: d.date, value: d.revenue }))} title="Revenue" />}
      </div>
    </div>
  );
}

