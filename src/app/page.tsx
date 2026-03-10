"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroBar } from "@/components/HeroBar";
import { TalentCarousel } from "@/components/marketing/TalentCarousel";
import { BottomDock } from "@/components/nav/BottomDock";
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

function scrollToRef(ref: React.RefObject<HTMLElement | null>, block: ScrollLogicalPosition = "start") {
  ref.current?.scrollIntoView({ behavior: "smooth", block });
}

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
  const [selectedPodIds, setSelectedPodIds] = useState<string[]>([]);
  const [showCampaignBoard, setShowCampaignBoard] = useState(false);

  const packageRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const campaignRef = useRef<HTMLElement>(null);

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;
  const isClient = role === "AGENCY";

  useEffect(() => {
    const pkgId = searchParams.get("package");
    const skip = searchParams.get("skip");

    // Auth-aware skip: logged-in users coming from dashboard Discover
    // bypass the hero and land directly at the gallery
    if (skip === "gallery" && session?.user) {
      setShowTalentGallery(true);
      setShowPackages(true);
      setTimeout(() => scrollToRef(galleryRef, "start"), 120);
      return;
    }

    if (pkgId) {
      const pkg = PACKAGES.find((p) => p.id === pkgId);
      if (pkg) {
        setSelectedPackage(pkg);
        setSelectedRoles(pkg.roles.filter((v, i, a) => a.indexOf(v) === i));
        setShowTalentGallery(true);
        setShowPackages(true);
        setTimeout(() => scrollToRef(galleryRef), 400);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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
      setTimeout(() => scrollToRef(galleryRef), 200);
      setPendingDiscover(false);
    }
  }, [isClient, pendingDiscover]);

  const openGallery = () => {
    if (!session?.user) {
      setPendingDiscover(true);
      setClientAuthOpen(true);
      return;
    }
    setShowTalentGallery(true);
    setTimeout(() => scrollToRef(galleryRef), 200);
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
    <main className="bg-[#07070B] text-slate-200">
      {/* Ambient glow fixed across all sections */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] max-w-[800px] h-[40vh] blur-[120px] opacity-[0.14] bg-gradient-to-b from-white/50 via-white/10 to-transparent rounded-full" />
      </div>

      {/* SECTION 1: HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-[760px] mx-auto text-center space-y-6">

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
                {m === "client" ? "Client" : "Talent"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="space-y-3"
            >
              <h1 className="text-[30px] md:text-[36px] font-medium tracking-[-0.025em] text-white leading-[1.12]">
                {mode === "client" ? "Welcome to Creator Hive" : "Join Creator Hive"}
              </h1>
              <p className="text-[14px] text-white/38 font-light max-w-[420px] mx-auto leading-relaxed">
                {mode === "client"
                  ? "Book Top 1% talent seamlessly"
                  : "Showcase your work to top brands across the Gulf."}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === "client" && (
              <motion.div
                key="client-bar"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="space-y-4"
              >
                <HeroBar
                  mode={mode}
                  onQueryChange={(q) => { setSearchQuery(q); if (q) openGallery(); }}
                  onRolesChange={(roles) => { setSelectedRoles(roles); if (roles.length) openGallery(); }}
                  onDiscover={openGallery}
                />

                <div className="pt-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showPackages;
                      setShowPackages(next);
                      if (next) {
                        setTimeout(() => scrollToRef(packageRef, "start"), 120);
                      }
                    }}
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
              </motion.div>
            )}

            {mode === "talent" && (
              <motion.div
                key="talent-bar"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="space-y-4"
              >
                <HeroBar
                  mode={mode}
                  onQueryChange={(q) => setSearchQuery(q)}
                  onRolesChange={(roles) => setSelectedRoles(roles)}
                  onDiscover={() => setTalentAuthOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => setTalentAuthOpen(true)}
                  className="px-8 py-3 bg-white text-[#0B0F14] rounded-xl text-[13px] font-medium hover:bg-white/90 transition-all shadow-[0_4px_28px_rgba(255,255,255,0.10)]"
                >
                  Apply to join the Hive →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Disclaimer pinned to bottom of hero screen */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-[11px] text-white/18 tracking-wide whitespace-nowrap">
            Creator Hive is human-first. Please clearly label any AI-generated media.
          </p>
        </div>
      </section>

      {/* SECTION 2: PACKAGES — full screen */}
      <AnimatePresence>
        {mode === "client" && showPackages && (
          <motion.section
            ref={packageRef}
            key="packages-section"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-16"
          >
            <div className="w-full max-w-[1120px] mx-auto">
              <PackageSelector
                onSelect={handlePackageSelect}
                onSkip={handlePackageSkip}
                selectedPackageId={selectedPackage?.id ?? null}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SECTION 3: TALENT GALLERY — full screen */}
      <AnimatePresence>
        {mode === "client" && showTalentGallery && (
          <motion.section
            ref={galleryRef}
            key="gallery-section"
            id="talent-gallery"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-16"
          >
            {/* Deep amethyst ambient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[70vh] blur-[180px] opacity-[0.065] rounded-full" style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #4c1d95 60%, transparent 100%)" }} />
            </div>
            <div className="relative z-10 w-full max-w-7xl mx-auto">
              {selectedPackage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-3"
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
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SECTION 4: CAMPAIGN BOARD */}
      <AnimatePresence>
        {showCampaignBoard && (
          <motion.section
            ref={campaignRef}
            key="campaign-section"
            id="campaign-board"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 min-h-screen flex flex-col justify-start pt-20 pb-24"
            style={{ background: "linear-gradient(to bottom, rgba(7,7,11,0) 0%, rgba(7,7,11,1) 80px)" }}
          >
            {/* Deep amethyst ambient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-[50vh] blur-[160px] opacity-[0.055] rounded-full" style={{ background: "radial-gradient(ellipse, #6d28d9 0%, #3b0764 60%, transparent 100%)" }} />
            </div>
            <CampaignSetupBoard
              talents={selectedTalents}
              selectedPkg={selectedPackage}
              onClose={() => setShowCampaignBoard(false)}
              onClear={clearPod}
              onRequestAuth={() => {
                setPendingDiscover(true);
                setClientAuthOpen(true);
              }}
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* POD TRAY — fixed bottom */}
      <AnimatePresence>
        {showTalentGallery && selectedPodIds.length > 0 && !showCampaignBoard && (
          <motion.div
            className="fixed bottom-[calc(88px+16px)] left-1/2 -translate-x-1/2 z-40 w-[min(720px,94vw)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(15,18,24,0.94)] backdrop-blur-2xl border border-white/[0.10] rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.7)]">
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
                    setTimeout(() => scrollToRef(campaignRef), 120);
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
            setTimeout(() => scrollToRef(galleryRef), 200);
            setPendingDiscover(false);
          }
        }}
      />

      <TalentOnboardingDialogFey open={talentAuthOpen} onClose={() => setTalentAuthOpen(false)} onSuccess={() => {}} />

      {/* Bottom dock — activates post sign-in on landing page */}
      {session?.user && <BottomDock />}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070B]" />}>
      <HomePageContent />
    </Suspense>
  );
}
