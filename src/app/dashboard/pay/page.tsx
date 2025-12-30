'use client'
import { useMemo, useState } from "react";
import useSWR from "swr";

type Method = "bank" | "stripe";
const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function PayPage() {
  const [method, setMethod] = useState<Method>("bank");
  const [fileName, setFileName] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [trn, setTrn] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [campaignRef, setCampaignRef] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const { data: campaigns } = useSWR("/api/agency/campaigns", fetcher);
  const campaignOptions = campaigns?.data ?? [];

  const canSubmit = useMemo(
    () => company.trim() && billingEmail.trim() && amount.trim(),
    [company, billingEmail, amount],
  );

  const submitBankTransfer = async () => {
    if (!canSubmit) return;
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/payments/bank-transfer-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company,
        trn,
        billingEmail,
        campaignRef,
        amount,
        fileName,
      }),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      const payload = await res.json().catch(() => null);
      setError(payload?.error || "Failed to submit request.");
      setStatus("error");
    }
  };

  const handleStripe = async () => {
    setStatus("submitting");
    const res = await fetch("/api/payments/stripe-checkout", { method: "POST" });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      setStatus("error");
      setError(data?.warning || "Stripe test mode not configured.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7FB] px-7 py-6">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-slate-900">Pay</h1>
            <p className="text-sm text-slate-600 mt-1">Send payment to start or complete a campaign</p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <MethodCard
            title="Bank transfer"
            description="Upload trade license, generate e-invoice, and track status."
            active={method === "bank"}
            onSelect={() => setMethod("bank")}
          />
          <MethodCard
            title="Card (Stripe)"
            description="Pay securely by card. Test mode if not configured."
            active={method === "stripe"}
            onSelect={() => setMethod("stripe")}
          />
        </div>

        <section className="rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-5">
          {method === "bank" ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Company legal name"
                  required
                  value={company}
                  onChange={setCompany}
                  placeholder="Creator Hive FZE"
                />
                <Field
                  label="TRN"
                  value={trn}
                  onChange={setTrn}
                  placeholder="Optional"
                />
                <Field
                  label="Billing email"
                  required
                  value={billingEmail}
                  onChange={setBillingEmail}
                  placeholder="finance@company.com"
                />
                <div className="space-y-2">
                  <label className="text-xs text-slate-600">Campaign reference</label>
                  {campaignOptions.length > 0 ? (
                    <select
                      value={campaignRef}
                      onChange={(e) => setCampaignRef(e.target.value)}
                      className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm outline-none"
                    >
                      <option value="">Select campaign</option>
                      {campaignOptions.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={campaignRef}
                      onChange={(e) => setCampaignRef(e.target.value)}
                      className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm outline-none"
                      placeholder="Campaign reference"
                    />
                  )}
                </div>
                <Field
                  label="Amount (AED)"
                  required
                  value={amount}
                  onChange={setAmount}
                  placeholder="10000"
                />
                <div className="space-y-2">
                  <label className="text-xs text-slate-600">Trade License</label>
                  <label className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[rgba(0,0,0,0.08)] bg-[#F6F7FB] text-slate-600 cursor-pointer text-sm">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setFileName(file?.name ?? null);
                      }}
                    />
                    {fileName ? `Uploaded: ${fileName}` : "Click to upload trade license"}
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#F9FAFC] p-4 space-y-1">
                <div className="text-sm font-semibold text-slate-900">E-invoice preview</div>
                <div className="text-xs text-slate-600">
                  A PDF preview will be generated after upload. You&apos;ll receive a copy via email.
                </div>
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="flex items-center justify-between">
                <StatusTimeline status={status} />
                <button
                  type="button"
                  onClick={submitBankTransfer}
                  disabled={!canSubmit || status === "submitting"}
                  className="rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 transition disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Send invoice"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-900">Stripe direct payment</div>
              <p className="text-sm text-slate-600">
                Use Stripe test mode to generate a checkout link. If Stripe is not configured, you will see a warning.
              </p>
              <button
                type="button"
                onClick={handleStripe}
                className="rounded-full bg-indigo-600 text-white px-5 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 transition w-fit disabled:opacity-60"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Preparing…" : "Pay by card"}
              </button>
              {error && <div className="text-sm text-red-500">{error}</div>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MethodCard({
  title,
  description,
  active,
  onSelect,
}: {
  title: string;
  description: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col items-start rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-4 text-left shadow-sm transition ${
        active ? "ring-2 ring-indigo-200" : "hover:border-[rgba(0,0,0,0.16)]"
      }`}
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </button>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function StatusTimeline({ status }: { status: "idle" | "submitting" | "sent" | "error" }) {
  const steps = ["Submitted", "Verified", "Invoice sent", "Paid"];
  const activeIndex = status === "idle" ? -1 : status === "submitting" ? 1 : status === "sent" ? 2 : 1;

  return (
    <div className="flex items-center gap-3 text-xs text-slate-600">
      {steps.map((step, idx) => {
        const done = idx <= activeIndex;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full border ${
                done ? "bg-emerald-500 border-emerald-500" : "border-[rgba(0,0,0,0.15)]"
              }`}
            />
            <span className={done ? "text-slate-900 font-semibold" : ""}>{step}</span>
            {idx < steps.length - 1 && <span className="w-6 border-t border-dashed border-[rgba(0,0,0,0.2)]" />}
          </div>
        );
      })}
    </div>
  );
}
