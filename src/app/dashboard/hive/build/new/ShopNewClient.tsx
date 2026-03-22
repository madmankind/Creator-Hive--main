"use client";

import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[14px] text-white/[0.92] outline-none placeholder:text-white/30 focus:border-teal-400/30";

const PRODUCT_TYPES = ["Merch", "Digital", "Physical", "Membership", "Productized"] as const;

const SALES_RAILS = ["TikTok Shop", "Shopify", "Fourthwall", "Gumroad", "Not sure yet"] as const;

const NEED_OPTIONS = [
  "Validate only",
  "Research + strategy",
  "Full build",
  "Growth / launch support",
] as const;

export type ShopIntent = "validate" | "build" | "grow";

function resolveIntent(searchParams: URLSearchParams): ShopIntent {
  const raw = searchParams.get("intent");
  if (raw === "build" || raw === "grow" || raw === "validate") return raw;
  const mode = searchParams.get("mode");
  if (mode === "grow") return "grow";
  return "validate";
}

function defaultNeedForIntent(intent: ShopIntent): (typeof NEED_OPTIONS)[number] {
  if (intent === "build") return "Full build";
  if (intent === "grow") return "Growth / launch support";
  return "Validate only";
}

const STEPS = ["Product", "Market", "Need"] as const;
const maxStep = 3;

export function ShopNewClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<string>(PRODUCT_TYPES[0]);
  const [productConcept, setProductConcept] = useState("");
  const [whyNow, setWhyNow] = useState("");

  const [audience, setAudience] = useState("");
  const [channelsTraction, setChannelsTraction] = useState("");
  const [preferredRail, setPreferredRail] = useState<string>(SALES_RAILS[0]);

  const [need, setNeed] = useState<(typeof NEED_OPTIONS)[number]>(() => defaultNeedForIntent(resolveIntent(params)));
  const [budgetBand, setBudgetBand] = useState("");
  const [timing, setTiming] = useState("");
  const [references, setReferences] = useState("");

  const validateStep = (s: number) => {
    if (s === 1) return title.trim().length > 0 && productConcept.trim().length > 0 && whyNow.trim().length > 0;
    if (s === 2) return audience.trim().length > 0 && channelsTraction.trim().length > 0 && preferredRail.length > 0;
    if (s === 3) return need.length > 0 && budgetBand.trim().length > 0 && timing.trim().length > 0;
    return true;
  };

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const body = {
        mode: "LAUNCH" as const,
        productType,
        title: title.trim(),
        budgetBand: budgetBand.trim() || undefined,
        brief: {
          productConcept: productConcept.trim(),
          whyNow: whyNow.trim(),
          audience: audience.trim(),
          channels: channelsTraction.trim(),
          platformPresence: preferredRail,
          launchTiming: timing.trim(),
          needFromHive: [need],
          existingAssets: "",
          references: references.trim(),
        },
      };
      const r = await fetch("/api/creator-shop/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const j = (await r.json()) as { project?: { id: string } };
      if (!r.ok) {
        setErr("Submit failed.");
        return;
      }
      if (j.project?.id) router.push(`/dashboard/hive/build/${j.project.id}`);
      else router.push("/dashboard/hive/build");
      router.refresh();
    } catch {
      setErr("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    setErr(null);
    if (!validateStep(step)) {
      setErr("Complete this step.");
      return;
    }
    setStep((s) => Math.min(maxStep, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="mx-auto flex min-h-[min(80vh,720px)] w-full max-w-[560px] flex-col pb-28 pt-1 lg:max-w-[600px]">
      <header className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Build · Qualify</p>
        <h1 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-white/[0.94]">Product brief</h1>
      </header>

      <div className="mb-4 flex gap-1.5">
        {STEPS.map((l, i) => (
          <div
            key={l}
            className={cn(
              "h-1 flex-1 rounded-full transition",
              i < step - 1 ? "bg-white/25" : i === step - 1 ? "bg-teal-400/55" : "bg-white/[0.08]",
            )}
            title={l}
          />
        ))}
      </div>

      <div className="flex-1 space-y-4">
        {step === 1 ? (
          <>
            <Field label="Title / idea">
              <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Working title" />
            </Field>
            <Field label="Type">
              <select className={field} value={productType} onChange={(e) => setProductType(e.target.value)}>
                {PRODUCT_TYPES.map((pt) => (
                  <option key={pt} value={pt} className="bg-[#0c0c12]">
                    {pt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="One-line concept">
              <textarea className={cn(field, "min-h-[88px]")} value={productConcept} onChange={(e) => setProductConcept(e.target.value)} />
            </Field>
            <Field label="Why now">
              <textarea className={cn(field, "min-h-[88px]")} value={whyNow} onChange={(e) => setWhyNow(e.target.value)} />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Field label="Audience">
              <textarea className={cn(field, "min-h-[80px]")} value={audience} onChange={(e) => setAudience(e.target.value)} />
            </Field>
            <Field label="Channels / traction">
              <textarea
                className={cn(field, "min-h-[88px]")}
                value={channelsTraction}
                onChange={(e) => setChannelsTraction(e.target.value)}
                placeholder="Where you sell or post today"
              />
            </Field>
            <Field label="Preferred sales rail">
              <select className={field} value={preferredRail} onChange={(e) => setPreferredRail(e.target.value)}>
                {SALES_RAILS.map((sr) => (
                  <option key={sr} value={sr} className="bg-[#0c0c12]">
                    {sr}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35">Need from Hive</p>
              <div className="flex flex-col gap-2">
                {NEED_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNeed(n)}
                    className={cn(
                      "min-h-[44px] rounded-2xl px-4 py-3 text-left text-[13px] font-medium ring-1 transition sm:min-h-0",
                      need === n ? "bg-white/[0.12] text-white/90 ring-white/15" : "text-white/55 ring-white/[0.08] hover:bg-white/[0.04]",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Budget range">
              <input className={field} value={budgetBand} onChange={(e) => setBudgetBand(e.target.value)} placeholder="e.g. $2–5k" />
            </Field>
            <Field label="Timing">
              <input className={field} value={timing} onChange={(e) => setTiming(e.target.value)} placeholder="Target window" />
            </Field>
            <Field label="Links / references">
              <textarea className={cn(field, "min-h-[80px]")} value={references} onChange={(e) => setReferences(e.target.value)} />
            </Field>
          </>
        ) : null}
      </div>

      {err ? <p className="mt-3 text-[12px] text-amber-200/90">{err}</p> : null}

      <div className="mt-auto border-t border-white/[0.06] pt-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (step === 1 ? router.push("/dashboard/hive/build") : back())}
            className="min-h-[44px] text-[12px] font-semibold text-white/45 hover:text-white/75 sm:min-h-0"
          >
            {step === 1 ? "Close" : "Back"}
          </button>
          {step < maxStep ? (
            <button
              type="button"
              onClick={next}
              className="h-11 min-w-[120px] rounded-full bg-white/[0.1] px-5 text-[12px] font-semibold text-white/90 ring-1 ring-white/[0.12] sm:h-10"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="h-11 min-w-[120px] rounded-full bg-white/[0.12] px-5 text-[12px] font-semibold text-white/90 ring-1 ring-white/[0.14] disabled:opacity-40 sm:h-10"
            >
              {busy ? "…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35">{label}</p>
      {children}
    </div>
  );
}
