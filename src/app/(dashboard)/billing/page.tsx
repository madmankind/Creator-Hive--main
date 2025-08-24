"use client";
import { useState } from "react";

export default function BillingPage() {
  const [status, setStatus] = useState<"not_connected" | "pending" | "active">("not_connected");
  return (
    <main className="container py-10 grid gap-6">
      <h1 className="text-2xl font-semibold">Billing · Stripe Connect</h1>
      <section className="p-6 glass rounded-lg grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[color:var(--text-secondary)]">Connection Status</div>
            <div className="mt-1 font-medium">
              {status === "not_connected" && "Not Connected"}
              {status === "pending" && "Pending Verification"}
              {status === "active" && "Active"}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs ${status === "active" ? "bg-green-500/20 text-green-400" : status === "pending" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-400"}`}>
            {status}
          </div>
        </div>
        <div className="flex gap-3">
          {status === "not_connected" && (
            <button onClick={() => setStatus("pending")} className="h-10 px-4 rounded-md bg-[color:var(--color-accent)] text-black font-medium">Start Onboarding</button>
          )}
          {status !== "not_connected" && (
            <button onClick={() => setStatus(status === "pending" ? "active" : "not_connected")} className="h-10 px-4 rounded-md border border-[color:var(--color-border)]">{status === "pending" ? "Mark Active" : "Disconnect"}</button>
          )}
        </div>
        <div className="text-sm text-[color:var(--text-secondary)]">Payout schedule: Weekly · Platform fee: 10%</div>
      </section>
    </main>
  );
}

