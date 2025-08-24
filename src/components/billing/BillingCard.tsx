"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { fetcher } from "@/lib/fetcher";

type StripeState = {
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

type UserWithId = { id?: string };

export default function BillingCard() {
  const { data: session } = useSession();
  const { data, isLoading, mutate } = useSWR<StripeState>("/api/me/stripe", fetcher);
  const [loadingLink, setLoadingLink] = useState(false);

  const status = useMemo(() => {
    if (!data) return "loading" as const;
    if (data.chargesEnabled && data.payoutsEnabled) return "active" as const;
    if (data.accountId) return "pending" as const;
    return "not_connected" as const;
  }, [data]);

  async function handleConnect() {
    if (!session?.user) return;
    try {
      setLoadingLink(true);
      const origin = window.location.origin;
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: (session.user as UserWithId).id,
          refreshUrl: `${origin}/billing?refresh=1`,
          returnUrl: `${origin}/billing?connected=1`,
        }),
      });
      const json = await res.json();
      if (json?.url) window.location.href = json.url;
    } finally {
      setLoadingLink(false);
      mutate();
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Stripe Connect</h3>
          <p className="text-sm text-neutral-400">Enable payouts and charge clients via the platform.</p>
        </div>
        <span
          className={
            "px-3 py-1 text-xs rounded-full border " +
            (status === "active"
              ? "border-emerald-400/30 text-emerald-300"
              : status === "pending"
              ? "border-amber-400/30 text-amber-300"
              : status === "loading"
              ? "border-neutral-500/30 text-neutral-300"
              : "border-rose-400/30 text-rose-300")
          }
        >
          {isLoading ? "Checking…" : status === "active" ? "Active" : status === "pending" ? "Action needed" : "Not connected"}
        </span>
      </div>

      <div className="mt-4 text-sm text-neutral-300">
        {status === "active" && <p>✅ Your account is ready. You can receive payouts and process charges.</p>}
        {status === "pending" && <p>⚠️ Finish onboarding to enable charges/payouts.</p>}
        {status === "not_connected" && <p>Connect your Stripe Express account to start billing.</p>}
      </div>

      <div className="mt-6">
        {status !== "active" && (
          <button onClick={handleConnect} disabled={loadingLink} className="rounded-xl border border-white/10 px-4 py-2 hover:border-white/20 disabled:opacity-60">
            {loadingLink ? "Preparing…" : status === "pending" ? "Resume onboarding" : "Connect Stripe"}
          </button>
        )}
      </div>
    </div>
  );
}

