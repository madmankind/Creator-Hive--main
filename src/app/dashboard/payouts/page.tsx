"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PayoutsPage() {
  const { data: statusData, mutate } = useSWR("/api/creator/stripe/connect/status", fetcher);

  const startOnboarding = async () => {
    const res = await fetch("/api/creator/stripe/connect/start", { method: "POST" });
    const body = await res.json().catch(() => null);
    if (body?.url) {
      window.location.href = body.url;
    }
  };

  const status = statusData?.status || "NOT_STARTED";
  const accountId = statusData?.accountId;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <h1 className="text-2xl font-semibold text-white/90">Payouts</h1>
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 space-y-3">
        <div className="text-sm text-white/80">
          Stripe Connect onboarding status: <span className="font-semibold">{status}</span>
        </div>
        {accountId && (
          <div className="text-xs text-white/60">
            Account: {accountId}
          </div>
        )}
        <div className="flex items-center gap-3">
          {status !== "COMPLETE" && (
            <button
              onClick={startOnboarding}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              {status === "NOT_STARTED" ? "Start onboarding" : "Continue onboarding"}
            </button>
          )}
          <button
            onClick={() => mutate()}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          >
            Refresh status
          </button>
        </div>
      </div>
    </main>
  );
}
