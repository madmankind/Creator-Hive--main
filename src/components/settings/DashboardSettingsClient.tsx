"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";
import {
  SettingsShell,
  SettingsRail,
  SettingsDesktopSectionHeader,
  SettingsSubpage,
  SettingsMobileRootRow,
  SettingsDesktopContentFrame,
  st,
} from "./settingsPrimitives";
import { AccountPanel, BillingPanel, SupportPanel, WorkspacePanel } from "./settingsPanels";

type SectionId = "account" | "workspace" | "billing" | "support";

type LegalPayload = {
  accepted: boolean;
  version: string | null;
  acceptedAt: string | null;
  currentVersion: string;
  upToDate: boolean;
};

type AgencyPayload = { agency: { name: string; website?: string | null; location?: string | null } | null };

type StripeStatusPayload = { status: "NOT_STARTED" | "PENDING" | "COMPLETE"; accountId: string | null };

const SECTION_META: Record<SectionId, { title: string; subtitle: string }> = {
  account: { title: "Account", subtitle: "Your identity, sign-in, and session on this device." },
  workspace: { title: "Workspace", subtitle: "Brand context, setup, and creator preferences." },
  billing: { title: "Billing", subtitle: "Stripe payouts for creator earnings." },
  support: { title: "Support", subtitle: "Legal acceptance, policies, and how to reach us." },
};

export function DashboardSettingsClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;

  const [legal, setLegal] = useState<LegalPayload | null>(null);
  const [agency, setAgency] = useState<AgencyPayload["agency"] | undefined>(undefined);
  const [stripe, setStripe] = useState<StripeStatusPayload | null>(null);
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [section, setSection] = useState<SectionId>("account");
  const [mobileDrill, setMobileDrill] = useState(false);
  const [isLg, setIsLg] = useState(false);

  const showBrand = role === "AGENCY" || role === "ADMIN";
  const showTalent = role === "CREATOR" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const showWorkspace = showBrand || showTalent;
  const showBilling = showTalent;

  const rail = useMemo(() => {
    const rows: { id: SectionId; label: string }[] = [{ id: "account", label: "Account" }];
    if (showWorkspace) rows.push({ id: "workspace", label: "Workspace" });
    if (showBilling) rows.push({ id: "billing", label: "Billing" });
    rows.push({ id: "support", label: "Support" });
    return rows;
  }, [showWorkspace, showBilling]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setIsLg(mq.matches);
      if (mq.matches) setMobileDrill(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (section === "billing" && !showBilling) setSection("account");
    if (section === "workspace" && !showWorkspace) setSection("account");
  }, [section, showBilling, showWorkspace]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await fetch("/api/legal-acceptance", { credentials: "include" });
        if (!r.ok) return;
        if (!c) setLegal((await r.json()) as LegalPayload);
      } catch {
        if (!c) setBanner("Could not load legal status.");
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  useEffect(() => {
    if (role !== "AGENCY" && role !== "ADMIN") return;
    let c = false;
    (async () => {
      try {
        const r = await fetch("/api/agency/me", { credentials: "include" });
        if (!r.ok) return;
        const j = (await r.json()) as AgencyPayload;
        if (!c) setAgency(j.agency);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      c = true;
    };
  }, [role]);

  useEffect(() => {
    if (!showBilling) return;
    let c = false;
    (async () => {
      try {
        const r = await fetch("/api/creator/stripe/connect/status", { credentials: "include" });
        if (!r.ok) return;
        if (!c) setStripe((await r.json()) as StripeStatusPayload);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      c = true;
    };
  }, [role, showBilling]);


  const goBack = useCallback(() => {
    if (!isLg && mobileDrill) {
      setMobileDrill(false);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else if (role === "CREATOR") router.push("/dashboard/creator");
    else router.push("/dashboard/campaigns?mode=track");
  }, [router, role, isLg, mobileDrill]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack]);

  const startPayout = async () => {
    setPayoutBusy(true);
    setBanner(null);
    try {
      const r = await fetch("/api/creator/stripe/connect/start", { method: "POST", credentials: "include" });
      const j = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !j.url) {
        setBanner(j.error ?? "Could not open payout setup.");
        return;
      }
      window.location.assign(j.url);
    } catch {
      setBanner("Could not open payout setup.");
    } finally {
      setPayoutBusy(false);
    }
  };

  const selectSection = useCallback(
    (id: SectionId) => {
      setSection(id);
      if (!isLg) setMobileDrill(true);
    },
    [isLg],
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ background: st.bg, color: feyTokens.colors.text.muted }}>
        <p className="text-[13px]">Loading…</p>
      </div>
    );
  }

  const email = session?.user?.email ?? "—";
  const name = session?.user?.name ?? email.split("@")[0] ?? "—";
  const image = session?.user?.image ?? null;
  const workspaceBadge =
    role === "AGENCY" ? "Brand" : role === "CREATOR" ? "Creator" : role === "ADMIN" ? "Admin" : "Member";

  const meta = SECTION_META[section];
  const mobileTitle = !isLg && mobileDrill ? meta.title : "Settings";

  const body =
    section === "account" ? (
      <AccountPanel
        name={name}
        email={email}
        image={image}
        workspaceBadge={workspaceBadge}
        onSignOut={() => void signOut({ callbackUrl: "/" })}
      />
    ) : section === "workspace" ? (
      <WorkspacePanel showBrand={showBrand} showTalent={showTalent} isAdmin={isAdmin} agency={agency} />
    ) : section === "billing" ? (
      <BillingPanel stripe={stripe} payoutBusy={payoutBusy} onPayout={() => void startPayout()} />
    ) : (
      <SupportPanel legal={legal} />
    );

  return (
    <SettingsShell>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <header
          className="sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b px-4 py-3 lg:hidden"
          style={{
            background: "rgba(7,7,11,0.94)",
            borderColor: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
            paddingTop: "max(0.65rem, env(safe-area-inset-top))",
          }}
        >
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:bg-white/[0.05]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
            aria-label={!isLg && mobileDrill ? "Back" : "Close settings"}
          >
            <ArrowLeft className="h-4 w-4 opacity-70" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[16px] font-semibold tracking-[-0.02em] text-white/[0.94]">{mobileTitle}</h1>
            {!mobileDrill ? (
              <p className="truncate text-[11px]" style={{ color: feyTokens.colors.text.label }}>
                Creator Hive
              </p>
            ) : (
              <p className="truncate text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                {meta.subtitle}
              </p>
            )}
          </div>
        </header>

        <aside
          className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:py-12"
          style={{
            borderColor: st.hairline,
            background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 55%)",
          }}
        >
          <p className="px-6 pb-4 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: feyTokens.colors.text.label }}>
            Settings
          </p>
          <SettingsRail items={rail} activeId={section} onSelect={(id) => setSection(id as SectionId)} />
        </aside>

        {!isLg && !mobileDrill ? (
          <div className="flex flex-1 flex-col gap-2 px-4 py-5">
            {rail.map((item) => (
              <SettingsMobileRootRow
                key={item.id}
                label={item.label}
                hint={SECTION_META[item.id].subtitle}
                onClick={() => selectSection(item.id)}
              />
            ))}
          </div>
        ) : null}

        {isLg || mobileDrill ? (
          <main
            className="flex flex-1 flex-col lg:min-h-screen lg:border-l lg:pt-0"
            style={{
              borderColor: st.hairline,
              background: isLg ? st.paneBg : undefined,
            }}
          >
            <div className="mx-auto flex w-full max-w-[min(92vw,52rem)] flex-1 flex-col px-4 pb-16 pt-3 xl:max-w-[56rem] lg:px-12 lg:pb-24 lg:pt-8">
              {isLg ? <SettingsDesktopSectionHeader title={meta.title} subtitle={meta.subtitle} /> : null}
              <SettingsSubpage className="px-0 pt-0">
                {isLg ? (
                  <SettingsDesktopContentFrame className="space-y-5">
                    {banner ? (
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-[12px] text-amber-100/90">
                        {banner}
                      </div>
                    ) : null}
                    {body}
                  </SettingsDesktopContentFrame>
                ) : (
                  <>
                    {banner ? (
                      <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-[12px] text-amber-100/90">
                        {banner}
                      </div>
                    ) : null}
                    {body}
                  </>
                )}
              </SettingsSubpage>
            </div>
          </main>
        ) : null}
      </div>
    </SettingsShell>
  );
}
