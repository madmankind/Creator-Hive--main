"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PaymentsPage() {
  const { data, isLoading } = useSWR("/api/wallet/transactions", fetcher);
  const rows = data?.data ?? [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 space-y-4">
      <h1 className="text-2xl font-semibold text-white/90">Payments (Ledger)</h1>
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
        {isLoading ? (
          <div className="text-white/60">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-white/60">No transactions yet.</div>
        ) : (
          <div className="space-y-2">
            {rows.map((row: any) => (
              <div key={row.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-white/90">
                <div>
                  <div className="font-semibold">{row.type}</div>
                  <div className="text-xs text-white/50">
                    {row.currency} {row.amount / 100} · {row.status} · {new Date(row.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-white/60">{row.stripeObjectType}:{row.stripeObjectId}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
