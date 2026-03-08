// src/app/page.tsx — Welcome → Talent Gallery → Campaign Board (seamless flow)
"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroBar } from "@/components/HeroBar";
import { TalentCarousel } from "@/components/marketing/TalentCarousel";
import { ClientAuthDialog } from "@/components/auth/ClientAuthDialog";
import { TalentOnboardingDialogFey } from "@/components/auth/TalentOnboardingDialogFey";
import { PodSetupOverlay } from "@/features/pod-setup/PodSetupOverlay";
import { CampaignSetupBoard } from "@/features/campaign/CampaignSetupBoard";
import { PackageSelector } from "@/features/campaign/PackageSelector";
import { curatedTalent } from "@/lib/curatedTalent";
import { PACKAGES, type PackageConfig } from "@/lib/packages";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles } from "lucide-react";

const curatedLookup = new Map(curatedTalent.map((t) => [t.id, t]));

function HomePageContent() {
  const [mode, setMode] = useState<"client" | "talent">("client");
  const [showTalentGallery, setShowTalentGallery] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [clientAuthOpen, setClientAuthOpen] = useState(false);
  const [talentAuthOpen, setTalentAuthOpen] = useState(false);
  const [pendingDiscover, setPendingDiscover] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageConfig | null>(null);

  // Pod state — session-only
  const [selectedPodIds, setSelectedPodIds] = useState<string[]>([]);
  const [showCampaignBoard, setShowCampaignBoard] = useState(false);

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;
  const isClient = role === "AGENCY";

  // Auto-select package from URL param
  useEffect(() => {
    const pkgId = searchParams.get("package");
    if (pkgId) {
      const pkg = PACKAGES.find((p) => p.id === pkgId);
      if (pkg) {
        setSelectedPackage(pkg);
        setSelectedRoles(pkg.roles.filter((v, i, a) => a.indexOf(v) === i));
        setShowTalentGallery(true);
        setShowPackages(true);
        setTimeout(() => {
          document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTalents = selectedPodIds
    .map((id) => curatedLookup.get(id))
    .filter(Boolean)
    .map((t) => {
      const talent = curatedLookup.get(t!.id)!;
      return { id: t!.id, name: t!.name, primaryRole: talent.primaryRole };
    });

  const addToPod = (talentId: string) =>
    setSelectedPodIds((prev) => (prev.includes(talentId) ? prev : [...prev, talentId]));
  const removeFromPod = (talentId: string) =>
    setSelectedPodIds((prev) => prev.filter((id) => id !== talentId));
  const clearPod = () => setSelectedPodIds([]);

  useEffect(() => {
    if (isClient && pendingDiscover) {
      setShowTalentGallery(true);
      setTimeout(() => {
        document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      setPendingDiscover(false);
    }
  }, [isClient, pendingDiscover]);

  const openGallery = () => {
    if (!session?.user) {
      setPendingDiscover(true);
      setClientAuthOpen(true);
      return;
    }
    if (!isClient) {
      setPendingDiscover(true);
      setClientAuthOpen(true);
      return;
    }
    setShowTalentGallery(true);
    setTimeout(() => {
      document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handlePackageSelect = (pkg: PackageConfig) => {
    setSelectedPackage(pkg);
    setSelectedRoles(pkg.roles.filter((v, i, a) => a.indexOf(v) === i));
    openGallery();
  };

  const handlePackageSkip = () => {
    setSelectedPackage(null);
    setSelectedRoles([]);
    openGallery();
  };

  return (
    <main className="min-h-screen bg-[#0B0F14] text-slate-200">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-[1000px] h-[50vh] blur-[100px] opacity-[0.12] bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full" />
        <div className="absolute top-[10vh] left-[20%] w-[40vw] h-[30vh] blur-[120px] opacity-[0.04] bg-violet-500 rounded-full" />
        <div className="absolute top-[10vh] right-[15%] w-[35vw] h-[25vh] blur-[120px] opacity-[0.04] bg-blue-500 rounded-full" />
      </div>

      {/* ── HERO ── */}
      <div className="relative pt-16 pb-10 px-6">
        <div className="w-full max-w-[1160px] mx-auto">

          {/* Mode toggle + headline */}
          <div className="text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/[0.09]">
              {(["client", "talent"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200",
                    mode === m
                      ? "bg-white/[0.12] text-white ring-1 ring-white/[0.18]"
                      : "text-white/45 hover:text-white/75"
                  )}
                >
                  {m === "client" ? "I'm a client" : "I'm a creator"}
                </button>
              ))}
            </div>

            <h1 className="text-[36px] md:text-[46px] font-semibold tracking-[-0.025em] text-white/92 leading-[1.15]">
              {mode === "client" ? (
                <>Book creative talent<br className="hidden md:block" /> for any campaign</>
              ) : (
                <>Join the Hive —<br className="hidden md:block" /> get discovered</>
              )}
            </h1>
            <p className="text-[15px] text-white/40 font-light max-w-[520px] mx-auto leading-relaxed">
              {mode === "client"
                ? "Pre-vetted creators, ready to deploy. Start searching or explore curated team packages."
                : "Showcase your work to top brands across the Gulf region."}
            </p>
          </div>

          {/* ── CLIENT: HERO SEARCH BAR ── */}
          <AnimatePresence mode="wait">
            {mode === "client" && (
              <motion.div
                key="client-hero"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="max-w-[680px] mx-auto space-y-5"
              >
                {/* Search bar */}
                <HeroBar
                  mode={mode}
                  onQueryChange={(q) => { setSearchQuery(q); if (q) openGallery(); }}
                  onRolesChange={(roles) => { setSelectedRoles(roles); if (roles.length) openGallery(); }}
                  onDiscover={openGallery}
                />

                {/* Discover button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={openGallery}
                    className="px-8 py-3 bg-white text-[#0B0F14] rounded-xl text-[13px] font-medium hover:bg-white/90 transition-all shadow-[0_4px_28px_rgba(255,255,255,0.10)]"
                  >
                    Discover talent →
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                  {[
                    { value: "500+", label: "Active brands" },
                    { value: "AED 50K+", label: "Avg campaign value" },
                    { value: "48hr", label: "Brief to kickoff" },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-[20px] font-semibold text-white/80 tracking-[-0.02em]">{value}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Packages CTA — subtle, secondary */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowPackages((p) => !p)}
                    className={cn(
                      "group flex items-center gap-2 px-4 py-2.5 rounded-full ring-1 transition-all duration-200 text-[12px]",
                      showPackages
                        ? "bg-white/[0.08] ring-white/[0.18] text-white/75"
                        : "bg-white/[0.04] ring-white/[0.08] text-white/35 hover:bg-white/[0.07] hover:text-white/60 hover:ring-white/[0.14]"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View pre-vetted, brand-ready teams to deploy</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showPackages && "rotate-180")} />
                  </button>
                </div>

                {/* Package selector — expandable */}
                <AnimatePresence>
                  {showPackages && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <PackageSelector
                          onSelect={handlePackageSelect}
                          onSkip={handlePackageSkip}
                          selectedPackageId={selectedPackage?.id ?? null}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── TALENT MODE ── */}
            {mode === "talent" && (
              <motion.div
                key="talent-mode"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="max-w-[640px] mx-auto space-y-4"
              >
                <HeroBar
                  mode={mode}
                  onQueryChange={(q) => setSearchQuery(q)}
                  onRolesChange={(roles) => setSelectedRoles(roles)}
                  onDiscover={() => setTalentAuthOpen(true)}
                />
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setTalentAuthOpen(true)}
                    className="px-8 py-3 bg-white text-[#0B0F14] rounded-xl text-[13px] font-medium hover:bg-white/90 transition-all shadow-[0_4px_28px_rgba(255,255,255,0.10)]"
                  >
                    Apply to join the Hive →
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                  {[
                    { value: "500+", label: "Active brands" },
                    { value: "AED 50K+", label: "Avg campaign value" },
                    { value: "48hr", label: "Brief to kickoff" },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-[20px] font-semibold text-white/80 tracking-[-0.02em]">{value}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── TALENT GALLERY — flows seamlessly from hero ── */}
      {mode === "client" && showTalentGallery && (
        <div className="relative">
          {/* Seamless fade-in separator — no hard border, just ambient depth */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Active package badge */}
          {selectedPackage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto px-6 pt-4 flex items-center gap-3"
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/[0.10] text-[12px] text-white/60">
                <span>{selectedPackage.emoji}</span>
                <span>{selectedPackage.name}</span>
                <span className="text-white/25">·</span>
                <span className="text-white/35">Showing matched talent</span>
                <button
                  onClick={() => { setSelectedPackage(null); setSelectedRoles([]); }}
                  className="ml-1 text-white/25 hover:text-white/55 transition-colors text-[11px]"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          {/* Search bar refinement */}
          {!selectedPackage && (
            <div className="max-w-7xl mx-auto px-6 pt-4">
              <div className="max-w-[600px]">
                <HeroBar
                  mode="client"
                  onQueryChange={(q) => setSearchQuery(q)}
                  onRolesChange={(roles) => setSelectedRoles(roles)}
                  onDiscover={() => {}}
                />
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-6 pb-4">
            <section id="talent-gallery" className="mt-6">
              <TalentCarousel
                talents={curatedTalent}
                query={searchQuery}
                selectedRoles={selectedRoles}
                selectedPodIds={selectedPodIds}
                selectedPackage={selectedPackage}
                onAddToPod={addToPod}
                onBook={(talent) => {
                  if (!selectedPodIds.includes(talent.id)) addToPod(talent.id);
                }}
                onTalentClick={(talentId) => {
                  if (selectedPodIds.includes(talentId)) removeFromPod(talentId);
                  else addToPod(talentId);
                }}
              />
            </section>
          </div>

          {/* ── CAMPAIGN SETUP BOARD — blended, no hard border ── */}
          <AnimatePresence>
            {showCampaignBoard && (
              <motion.div
                id="campaign-board"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="w-full pb-24"
                style={{
                  background: "linear-gradient(to bottom, transparent 0%, rgba(11,15,20,0.98) 80px)",
                }}
              >
                <CampaignSetupBoard
                  talents={selectedTalents}
                  selectedPkg={selectedPackage}
                  onClose={() => setShowCampaignBoard(false)}
                  onClear={clearPod}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── SLIM POD TRAY ── */}
      <AnimatePresence>
        {showTalentGallery && selectedPodIds.length > 0 && !showCampaignBoard && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(720px,94vw)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(15,18,24,0.94)] backdrop-blur-2xl border border-white/[0.10] rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.7)]">
              {/* Avatars */}
              <div className="flex items-center shrink-0">
                {selectedTalents.slice(0, 5).map((t, i) => (
                  <div
                    key={t.id}
                    className={cn(
                      "w-7 h-7 rounded-full bg-gradient-to-br from-white/[0.18] to-white/[0.07]",
                      "ring-1 ring-white/[0.15] flex items-center justify-center text-[11px] font-medium text-white/80",
                      i > 0 && "-ml-1.5"
                    )}
                  >
                    {t.name[0]}
                  </div>
                ))}
                {selectedTalents.length > 5 && (
                  <div className="w-7 h-7 rounded-full bg-white/[0.07] ring-1 ring-white/[0.10] -ml-1.5 flex items-center justify-center text-[10px] text-white/45">
                    +{selectedTalents.length - 5}
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-light text-white/82 leading-none">
                  {selectedTalents.length} talent{selectedTalents.length !== 1 ? "s" : ""} in pod
                </p>
                {selectedPackage && (
                  <p className="text-[10px] text-white/28 mt-0.5 truncate">
                    {selectedPackage.emoji} {selectedPackage.name}
                  </p>
                )}
              </div>

              {/* Package completion indicator */}
              {selectedPackage && (() => {
                const requiredRoles = [...new Set(selectedPackage.roles)];
                const filledRoles = selectedTalents.map((t) => t.primaryRole || "");
                const missing = requiredRoles.filter((r) => !filledRoles.includes(r));
                return missing.length > 0 ? (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/[0.08] ring-1 ring-amber-400/[0.15]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                    <span className="text-[10px] text-amber-300/55">
                      {missing.length} role{missing.length !== 1 ? "s" : ""} missing
                    </span>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] ring-1 ring-emerald-400/[0.20]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-300/70">Package complete</span>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={clearPod}
                  className="px-2.5 py-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCampaignBoard(true);
                    setTimeout(() => {
                      document.getElementById("campaign-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 100);
                  }}
                  className="px-4 py-2 bg-white text-[#0B0F14] rounded-xl text-[13px] font-medium hover:bg-white/90 transition-colors"
                >
                  Set up campaign →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PodSetupOverlay />

      <ClientAuthDialog
        open={clientAuthOpen}
        onClose={() => { setClientAuthOpen(false); setPendingDiscover(false); }}
        onSuccess={() => {
          if (pendingDiscover) {
            setShowTalentGallery(true);
            setTimeout(() => {
              document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 150);
            setPendingDiscover(false);
          }
        }}
      />

      <TalentOnboardingDialogFey open={talentAuthOpen} onClose={() => setTalentAuthOpen(false)} onSuccess={() => {}} />

      <footer className="mt-20 border-t border-white/[0.06] pt-5 pb-8 text-center">
        <p className="text-[11px] text-white/25">Creator Hive is human-first. Please clearly label any AI-generated media.</p>
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F14]" />}>
      <HomePageContent />
    </Suspense>
  );
}
