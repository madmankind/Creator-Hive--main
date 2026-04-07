"use client";

import { useState, useEffect, useLayoutEffect, useRef, Suspense, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroBar } from "@/components/HeroBar";
import { TalentCarousel } from "@/components/marketing/TalentCarousel";
import { BottomDock } from "@/components/nav/BottomDock";
import { HiveAuthModal } from "@/components/auth/HiveAuthModal";
import { PodSetupOverlay } from "@/features/pod-setup/PodSetupOverlay";
import { CampaignSetupBoard } from "@/features/campaign/CampaignSetupBoard";
import { PackageSelector } from "@/features/campaign/PackageSelector";
import { curatedTalent, getTalentDisplayName, type CuratedTalent } from "@/lib/curatedTalent";
import { PACKAGES, type PackageConfig } from "@/lib/packages";
import { useSession, signIn } from "next-auth/react";
import { HomeProfileMenu } from "@/components/nav/HomeProfileMenu";
import { ClientDiscoveryFlow } from "@/components/discovery/ClientDiscoveryFlow";
import { AdvisorRequestModal } from "@/components/discovery/AdvisorRequestModal";
import { useDiscoveryStore } from "@/store/useDiscoveryStore";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles } from "lucide-react";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { analytics } from "@/lib/analytics";
import { setGoogleJoinIntentForNextSignIn } from "@/lib/auth/googleJoinIntent";

const curatedLookup = new Map(curatedTalent.map((t) => [t.id, t]));

function HeroPhoneStep({ onSubmit, onBack }: { onSubmit: (phone: string) => void; onBack: () => void }) {
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);
  const [countryCode, setCountryCode] = useState("+971");
  const CODES = [
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+966", flag: "🇸🇦", name: "KSA" },
    { code: "+965", flag: "🇰🇼", name: "Kuwait" },
    { code: "+974", flag: "🇶🇦", name: "Qatar" },
    { code: "+973", flag: "🇧🇭", name: "Bahrain" },
    { code: "+968", flag: "🇴🇲", name: "Oman" },
    { code: "+1",   flag: "🇺🇸", name: "US" },
    { code: "+44",  flag: "🇬🇧", name: "UK" },
  ];
  const canSubmit = phone.trim().length >= 7;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Country code selector */}
        <div
          className="shrink-0 rounded-full bg-[#0D0D14] ring-1 ring-white/10 transition min-h-[48px] flex items-center"
          style={{ border: focused ? "1px solid rgba(255,255,255,0.20)" : undefined }}
        >
          <select
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
            className="bg-transparent outline-none text-[14px] text-slate-300 px-3 py-2 cursor-pointer"
            style={{ WebkitAppearance: "none", appearance: "none" }}
          >
            {CODES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
            ))}
          </select>
        </div>
        {/* Phone number input */}
        <div
          className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 hover:ring-white/15 transition p-2 pl-4 sm:pl-5 flex-1 flex items-center min-h-[48px]"
        >
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && canSubmit) onSubmit(countryCode + phone); }}
            placeholder="50 123 4567"
            autoFocus
            className="flex-1 bg-transparent outline-none text-[15px] leading-8 text-slate-200 placeholder:text-slate-400/40 min-w-0"
          />
        </div>
        <button
          type="button"
          onClick={() => canSubmit && onSubmit(countryCode + phone)}
          disabled={!canSubmit}
          className="shrink-0 rounded-full bg-white px-4 sm:px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition min-h-[44px] flex items-center justify-center"
        >
          Send code
        </button>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] text-white/30 hover:text-white/55 transition flex items-center gap-1.5"
        >
          ← Use email instead
        </button>
      </div>
    </div>
  );
}

function HeroInlineLoading({ onDone }: { onDone: () => void }) {
  return <LogoLoader onDone={onDone} duration={1400} size={56} showWordmark={false} />;
}

function scrollToRef(ref: React.RefObject<HTMLElement | null>, block: ScrollLogicalPosition = "start") {
  ref.current?.scrollIntoView({ behavior: "smooth", block });
}

const HERO_INTENT_KEY = "ch_hero_intent";

function persistHeroIntent(m: "client" | "talent") {
  try {
    sessionStorage.setItem(HERO_INTENT_KEY, m);
  } catch {
    /* ignore */
  }
}

function HomePageContent() {
  const [mode, setMode] = useState<"client" | "talent">("client");
  const [showTalentGallery, setShowTalentGallery] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [aiHighlightIds, setAiHighlightIds] = useState<string[]>([]);
  const [rosterExtras, setRosterExtras] = useState<CuratedTalent[]>([]);
  const [clientAuthOpen, setClientAuthOpen] = useState(false);
  const [pendingDiscover, setPendingDiscover] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageConfig | null>(null);
  const [selectedPodIds, setSelectedPodIds] = useState<string[]>([]);
  const [showCampaignBoard, setShowCampaignBoard] = useState(false);
  // Discovery flow state
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const discoveryStore = useDiscoveryStore();
  // Inline hero auth (replaces full-screen modal for initial sign-in)
  const [heroAuthStep, setHeroAuthStep] = useState<
    "idle" | "email" | "phone" | "otp" | "loading" | "waiting_session"
  >("idle");
  const [heroAuthEmail, setHeroAuthEmail] = useState("");
  const [heroAuthAuthMode, setHeroAuthAuthMode] = useState<"signup" | "login">("signup");
  const [heroAuthSubmitting, setHeroAuthSubmitting] = useState(false);
  const [heroAuthError, setHeroAuthError] = useState("");
  const [heroAuthPhone, setHeroAuthPhone] = useState("");
  const [heroAuthOtpVia, setHeroAuthOtpVia] = useState<"email" | "whatsapp">("email");
  const [heroAuthGoogleLoading, setHeroAuthGoogleLoading] = useState(false);
  const [heroOtpVerifying, setHeroOtpVerifying] = useState(false);
  const [heroOtpCode, setHeroOtpCode] = useState("");
  const [heroSignInNotice, setHeroSignInNotice] = useState<string | null>(null);
  const [authProviders, setAuthProviders] = useState<Record<string, unknown> | null>(null);
  const googleEnabled = Boolean(authProviders && "google" in authProviders);

  const packageRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const campaignRef = useRef<HTMLElement>(null);

  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const sessionPending = sessionStatus === "loading";
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;
  const isClient = role === "AGENCY";
  const [creatorOnboardingComplete, setCreatorOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p) => {
        if (!cancelled) setAuthProviders(p && typeof p === "object" ? (p as Record<string, unknown>) : null);
      })
      .catch(() => {
        if (!cancelled) setAuthProviders(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (role !== "CREATOR" || !session?.user) {
      setCreatorOnboardingComplete(null);
      return;
    }
    let cancelled = false;
    fetch("/api/onboarding/creator/profile")
      .then((r) => r.json())
      .then((data: { profile?: { onboardingCompletedAt?: string | null } | null }) => {
        if (!cancelled) {
          setCreatorOnboardingComplete(!!data.profile?.onboardingCompletedAt);
        }
      })
      .catch(() => {
        if (!cancelled) setCreatorOnboardingComplete(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, session?.user]);

  // Restore Client vs Talent after hard navigation (OAuth, replace("/"), refresh)
  useEffect(() => {
    try {
      const v = sessionStorage.getItem(HERO_INTENT_KEY);
      if (v === "talent") setMode("talent");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const c = searchParams.get("continueTalentOnboarding");
    if (c === "1" || c === "true") {
      persistHeroIntent("talent");
      setMode("talent");
      setHeroAuthStep("email");
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (heroAuthStep !== "waiting_session") return;
    if (session?.user) { setHeroAuthStep("idle"); return; }
    // Poll session every 500ms until it arrives, hard fallback at 8s
    const poll = setInterval(() => void updateSession(), 500);
    const t = setTimeout(() => { clearInterval(poll); setHeroAuthStep("idle"); }, 8000);
    return () => { clearInterval(poll); clearTimeout(t); };
  }, [heroAuthStep, session?.user, updateSession]);

  // Creators who still owe hero onboarding always see the Talent experience (not client brief / hire UI)
  useEffect(() => {
    if (role !== "CREATOR" || !session?.user) return;
    if (creatorOnboardingComplete !== false) return;
    persistHeroIntent("talent");
    setMode("talent");
  }, [role, session?.user, creatorOnboardingComplete]);

  // Brand (AGENCY) accounts cannot use the Talent tab — same email, different workspace type
  useEffect(() => {
    if (sessionPending || !session?.user) return;
    if (role !== "AGENCY") return;
    if (mode !== "talent") return;
    persistHeroIntent("client");
    setMode("client");
    setHeroSignInNotice(
      "This email is registered as a brand / client workspace. You're on Client now — use a different email if you also want a creator profile.",
    );
  }, [sessionPending, session?.user, role, mode]);

  // Talent: send creators to dashboard only after hero onboarding is complete
  useEffect(() => {
    if (role !== "CREATOR" || !session?.user) return;
    const auth = searchParams.get("auth");
    const bookId = searchParams.get("book");
    const pkgId = searchParams.get("package");
    const skip = searchParams.get("skip");
    const continueTalent = searchParams.get("continueTalentOnboarding");
    if (auth || bookId || pkgId || skip === "gallery") return;
    if (continueTalent === "1" || continueTalent === "true") return;
    if (creatorOnboardingComplete === null) return;
    if (creatorOnboardingComplete === false) return;
    router.replace("/dashboard/creator");
  }, [role, session?.user, router, searchParams, creatorOnboardingComplete]);


  useEffect(() => {
    const pkgId  = searchParams.get("package");
    const skip   = searchParams.get("skip");
    const auth   = searchParams.get("auth");
    const signin = searchParams.get("signin");
    const bookId = searchParams.get("book"); // ?book=[creatorId] from public profile "Book now"

    // Open auth modal when redirected from protected routes
    if (signin === "required" && !session?.user) {
      persistHeroIntent("client");
      setMode("client");
      setHeroAuthStep("email");
      return;
    }

    // Open auth modal when redirected from /signup?type=...
    if (auth === "talent" && !session?.user) {
      persistHeroIntent("talent");
      setMode("talent");
      setHeroAuthStep("email");
      return;
    }
    if (auth === "client" && !session?.user) {
      persistHeroIntent("client");
      setMode("client");
      setHeroAuthStep("email");
      return;
    }

    // ?book=[creatorId] — pre-select that creator in the pod and reveal gallery
    if (bookId) {
      const found = curatedLookup.get(bookId);
      if (found) {
        setSelectedPodIds((prev) => prev.includes(bookId) ? prev : [...prev, bookId]);
      }
      setShowTalentGallery(true);
      setShowPackages(true);
      setTimeout(() => scrollToRef(galleryRef, "start"), 300);
      return;
    }

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
  }, [session, searchParams]);

  const handleHeroEmailSubmit = async () => {
    if (!heroAuthEmail.trim()) return;
    setHeroAuthError("");
    setHeroAuthSubmitting(true);
    const email = heroAuthEmail.trim().toLowerCase();
    analytics.cta.heroEmailSubmitted(mode === "talent" ? "creator" : "brand");
    try {
      localStorage.setItem(`ch_${mode}_email`, email);
    } catch { /* ignore */ }

    // Step 1 — Check if this is a returning user
    try {
      const checkRes = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();

      if (checkRes.ok && checkData.isExistingUser) {
        const acctRole = checkData.role as string | undefined;
        setHeroAuthAuthMode("login");
        const displayName = checkData.name || email.split("@")[0];
        const userType = mode === "talent" ? "talent" : "client";

        const result = await signIn("credentials", {
          redirect: false,
          email,
          userType,
          displayName,
        });
        const ok = result?.ok || !result?.error || (typeof result?.error === "string" && result.error.toLowerCase().includes("configuration"));
        if (!ok) {
          // Fallback to OTP if direct sign-in fails for any reason
          setHeroAuthSubmitting(false);
          await sendOtpAndContinue(email);
          return;
        }
        if (acctRole === "AGENCY" && mode === "talent") {
          persistHeroIntent("client");
          setMode("client");
          setHeroSignInNotice(
            "This email is your brand workspace — opened Client for you. To join as a creator, sign up with another email.",
          );
        } else if (acctRole === "CREATOR" && mode === "client") {
          persistHeroIntent("talent");
          setMode("talent");
          setHeroSignInNotice("This email is your creator account — opened Talent for you.");
        }
        setHeroAuthSubmitting(false);
        void updateSession();
        setHeroAuthStep("loading");
        analytics.loginCompleted("email");
        return;
      }
    } catch { /* non-fatal — fall through to OTP */ }

    // Step 2 — New user or check failed — send OTP
    await sendOtpAndContinue(email);
  };

  /** Send OTP email and transition to OTP step */
  const sendOtpAndContinue = async (email: string) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHeroAuthError(data.error || "Failed to send code. Try again.");
        setHeroAuthSubmitting(false);
        return;
      }
      if (data.isExistingUser) {
        setHeroAuthAuthMode("login");
        analytics.loginStarted("email");
      } else {
        analytics.signupStarted(mode);
      }
    } catch {
      setHeroAuthError("Network error. Check your connection.");
      setHeroAuthSubmitting(false);
      return;
    }

    setHeroAuthSubmitting(false);
    setHeroAuthOtpVia("email");
    setHeroAuthStep("otp");
  };

  const handleHeroOTPVerify = async (otpOverride?: string) => {
    if (heroOtpVerifying) return;
    setHeroOtpVerifying(true);
    setHeroAuthError("");

    const otp = otpOverride || heroOtpCode.trim();
    const email =
      heroAuthEmail.trim() ||
      (heroAuthPhone ? `${heroAuthPhone.replace(/\D/g, "")}@creatorhive.phone` : "");
    if (!email) {
      setHeroAuthError("Missing email or phone.");
      setHeroOtpVerifying(false);
      return;
    }

    // Step 1 — verify the OTP code against the database
    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setHeroAuthError(verifyData.error || "Invalid code. Try again.");
        setHeroOtpVerifying(false);
        return;
      }
    } catch {
      setHeroAuthError("Network error. Check your connection.");
      setHeroOtpVerifying(false);
      return;
    }

    let existingAccountRole: string | undefined;
    try {
      const qlRes = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const qlData = await qlRes.json();
      if (qlRes.ok && qlData.isExistingUser) {
        existingAccountRole = qlData.role as string | undefined;
      }
    } catch {
      /* non-fatal */
    }

    // Step 2 — OTP verified, create the session
    const displayName = heroAuthEmail.trim()
      ? heroAuthEmail.split("@")[0]
      : heroAuthPhone.replace(/\D/g, "") || "Creator";

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        userType: mode,
        displayName,
      });
      const okish =
        result?.ok ||
        !result?.error ||
        (typeof result?.error === "string" && result.error.toLowerCase().includes("configuration"));
      if (!okish) {
        setHeroAuthError("Sign in failed. Please try again.");
        setHeroOtpVerifying(false);
        return;
      }
      if (existingAccountRole === "AGENCY" && mode === "talent") {
        persistHeroIntent("client");
        setMode("client");
        setHeroSignInNotice(
          "This email is your brand workspace — opened Client for you. To join as a creator, sign up with another email.",
        );
      } else if (existingAccountRole === "CREATOR" && mode === "client") {
        persistHeroIntent("talent");
        setMode("talent");
        setHeroSignInNotice("This email is your creator account — opened Talent for you.");
      }
      try {
        localStorage.setItem(`ch_${mode}_email`, email.toLowerCase());
      } catch { /* ignore */ }
    } catch {
      try {
        localStorage.setItem(`ch_${mode}_email`, email.toLowerCase());
      } catch { /* ignore */ }
    }

    // Force immediate session refetch — useSession doesn't auto-update after signIn
    void updateSession();

    setHeroOtpVerifying(false);
    analytics.heroOtpVerified(mode);
    setHeroAuthStep("loading");
    if (mode === "client" || heroAuthAuthMode === "login") {
      analytics.loginCompleted("otp");
    } else {
      analytics.signupStepCompleted("otp_verified");
    }
  };

  const handleHeroGoogleClick = async () => {
    setHeroAuthGoogleLoading(true);
    analytics.heroGoogleClicked(mode);
    try {
      if (mode === "talent") persistHeroIntent("talent");
      else persistHeroIntent("client");
      setGoogleJoinIntentForNextSignIn(mode === "talent" ? "creator" : "client");
      await signIn("google", {
        callbackUrl: mode === "talent" ? "/?continueTalentOnboarding=1" : "/",
      });
    } catch {
      setHeroAuthGoogleLoading(false);
    }
  };

  const handleHeroPhoneSubmit = (phone: string) => {
    setHeroAuthPhone(phone);
    setHeroAuthOtpVia("whatsapp");
    setHeroAuthStep("otp");
  };

  useEffect(() => {
    const need = aiHighlightIds.filter((id) => id.startsWith("db:"));
    if (need.length === 0) {
      setRosterExtras([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/marketing/matched-creators", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: need }),
        });
        const data = (await res.json()) as { talents?: CuratedTalent[] };
        if (!cancelled) setRosterExtras(data.talents ?? []);
      } catch {
        if (!cancelled) setRosterExtras([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [aiHighlightIds]);

  const displayTalents = useMemo(() => {
    const seen = new Set<string>();
    const out: CuratedTalent[] = [];
    for (const t of curatedTalent) {
      seen.add(t.id);
      out.push(t);
    }
    for (const t of rosterExtras) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        out.push(t);
      }
    }
    return out;
  }, [rosterExtras]);

  const talentById = useMemo(() => {
    const m = new Map<string, CuratedTalent>();
    for (const t of curatedTalent) m.set(t.id, t);
    for (const t of rosterExtras) m.set(t.id, t);
    return m;
  }, [rosterExtras]);

  const selectedTalents = selectedPodIds.map((id) => {
    const t = talentById.get(id);
    if (t) {
      return { id: t.id, name: t.displayName ?? getTalentDisplayName(t.name) ?? t.name, primaryRole: t.primaryRole };
    }
    return { id, name: id.replace("talent-", "").replace(/^db:/, "").replace(/-/g, " "), primaryRole: "Creator" };
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

  useEffect(() => {
    if (session?.user) setHeroAuthStep("idle");
  }, [session?.user]);

  // ─── Discovery gate: check if client needs to complete discovery ───
  useEffect(() => {
    if (!session?.user || role !== "AGENCY") return;
    if (discoveryStore.completed) return;
    const skip = searchParams.get("skip");
    const bookId = searchParams.get("book");
    const pkgId = searchParams.get("package");
    if (skip === "gallery" || bookId || pkgId) return;
    // Delay so HiveAuthModal close animation finishes before we show discovery
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/discovery/brief");
        const { brief } = await res.json();
        if (brief?.status === "COMPLETE") {
          discoveryStore.hydrate({ ...brief, completed: true });
          return;
        }
        if (brief) {
          discoveryStore.hydrate({
            primaryObjective: brief.primaryObjective ?? "",
            requestedRoles: brief.requestedRoles ?? [],
            startTiming: brief.startTiming ?? "",
            budgetRange: brief.budgetRange ?? "",
            companyName: brief.companyName ?? "",
            industry: brief.industry ?? "",
            notes: brief.notes ?? "",
            currentStep: brief.currentStep ?? 0,
            completed: false,
          });
          // Returning user with partial brief — don't force, let them use search bar
          return;
        }
        // No brief at all — brand new user
        setShowDiscovery(true);
      } catch { /* silent */ }
    }, 600); // Wait for auth modal close animation
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, role]);

  const openGallery = () => {
    if (!session?.user) {
      setPendingDiscover(true);
      setClientAuthOpen(true);
      return;
    }
    setShowTalentGallery(true);
    setTimeout(() => scrollToRef(galleryRef), 200);
  };

  /** Open client sign-in only (no post-auth jump to gallery) — e.g. brief upload */
  const requireClientSignIn = useCallback(() => {
    setClientAuthOpen(true);
  }, []);

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
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pb-24 sm:pb-6">
        {/* Deep amethyst ambient — matches sign-in page */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[70vh] rounded-full"
            style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #4c1d95 60%, transparent 100%)", filter: "blur(180px)", opacity: 0.13 }} />
        </div>
        <div className="w-full max-w-[680px] mx-auto text-center space-y-6">

          {/* Client/Talent toggle — hide when auth card showing */}
          {heroAuthStep === "idle" && (
          <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/[0.09]">
            {(["client", "talent"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  persistHeroIntent(m);
                  setHeroSignInNotice(null);
                  setMode(m);
                  // Auth gate moved to end of intake — don't open auth on toggle
                  if (session?.user) setHeroAuthStep("idle");
                }}
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
          )} {/* end heroAuthStep === "idle" toggle */}

          {/* Title + subtitle — hide when auth showing */}
          {heroAuthStep === "idle" && (
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
              <p className="text-[14px] text-white/38 font-light max-w-[420px] mx-auto leading-relaxed min-h-[46px]">
                {mode === "client"
                  ? "Book Top 1% talent seamlessly"
                  : "Showcase your work to brands globally"}
              </p>
            </motion.div>
          </AnimatePresence>
          )} {/* end heroAuthStep === "idle" title */}

          {heroSignInNotice ? (
            <div
              className="mx-auto max-w-[480px] rounded-xl px-4 py-3 text-left text-[12px] leading-relaxed text-amber-100/90"
              style={{
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.22)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <p>{heroSignInNotice}</p>
                <button
                  type="button"
                  onClick={() => setHeroSignInNotice(null)}
                  className="shrink-0 text-amber-200/50 hover:text-amber-100/80 text-[11px] uppercase tracking-wide"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col justify-start">
            {/* Auth UI — only shown during sign-in flow */}
            {((!session?.user && heroAuthStep !== "idle") || heroAuthStep === "loading" || heroAuthStep === "waiting_session") && (
              <div className="w-full">
                {/* Fey-style auth — frameless, floats on the dark page */}
                  <div className="w-full max-w-[440px] mx-auto">
                    <div className="px-2 py-6 flex flex-col items-center gap-5">
                      {heroAuthStep === "email" && (
                        <>
                          <div className="text-center space-y-2">
                            <p className="text-[22px] font-semibold tracking-tight text-white/90">
                              {heroAuthAuthMode === "signup"
                                ? <>Join <span style={{ color: "#a78bfa" }}>Creator Hive</span></>
                                : <>Login to <span style={{ color: "#a78bfa" }}>Creator Hive</span></>}
                            </p>
                            <p className="text-[13px] text-white/40 leading-snug">
                              {heroAuthAuthMode === "signup"
                                ? "Your brief is ready. Create an account to submit it."
                                : "Enter your email or login with your Google account."}
                            </p>
                          </div>

                          {/* Email input — Fey style: borderless pill with arrow button */}
                          <div className="w-full flex items-center gap-0 rounded-xl overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.09)" }}>
                            <input
                              type="email"
                              value={heroAuthEmail}
                              onChange={e => setHeroAuthEmail(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") handleHeroEmailSubmit(); }}
                              placeholder="Enter email"
                              autoFocus
                              className="flex-1 bg-transparent outline-none text-[14px] text-white/80 placeholder:text-white/30 px-4 py-3 min-w-0"
                            />
                            <button
                              type="button"
                              onClick={handleHeroEmailSubmit}
                              disabled={!heroAuthEmail.trim() || heroAuthSubmitting}
                              className="flex items-center justify-center w-10 h-10 mr-1 rounded-lg transition disabled:opacity-30"
                              style={{ background: heroAuthEmail.trim() && !heroAuthSubmitting ? "rgba(167,139,250,0.15)" : "transparent" }}
                            >
                              {heroAuthSubmitting
                                ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/><path d="M12 8l4 4-4 4M8 12h8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </button>
                          </div>

                          {heroAuthError && <p className="text-[11px] text-red-400/80 text-center">{heroAuthError}</p>}

                          {/* Divider */}
                          <div className="w-full flex items-center gap-3">
                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                            <span className="text-[10px] text-white/25 uppercase tracking-widest">or</span>
                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                          </div>

                          {/* Social auth */}
                          <div className="w-full flex flex-col gap-2">
                            {googleEnabled && (
                              <button type="button" onClick={handleHeroGoogleClick} disabled={heroAuthGoogleLoading}
                                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13px] transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.60)" }}
                                onMouseEnter={e => { if (!heroAuthGoogleLoading) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                                {heroAuthGoogleLoading
                                  ? <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                                  : <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.082 17.64 11.836 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>}
                                {heroAuthGoogleLoading ? "Connecting…" : "Sign in with Google"}
                              </button>
                            )}
                          </div>

                          <p className="text-[12px] text-white/25 text-center mt-2">
                            {heroAuthAuthMode === "signup"
                              ? <>Don&apos;t have an account yet?{" "}<button type="button" onClick={() => setHeroAuthAuthMode("login")} className="text-white/50 hover:text-white/75 transition underline underline-offset-2">Sign up</button></>
                              : <>Have an account?{" "}<button type="button" onClick={() => setHeroAuthAuthMode("signup")} className="text-white/50 hover:text-white/75 transition underline underline-offset-2">Sign up</button></>
                            }
                          </p>
                        </>
                      )}

                      {heroAuthStep === "phone" && (
                        <HeroPhoneStep onSubmit={handleHeroPhoneSubmit} onBack={() => setHeroAuthStep("email")} />
                      )}

                      {heroAuthStep === "otp" && (
                        <div className="w-full flex flex-col items-center gap-5">
                          <div className="text-center space-y-1.5">
                            <p className="text-[22px] font-semibold text-white/90">Check your inbox</p>
                            <p className="text-[13px] text-white/40 leading-snug">
                              We have sent you a secure login link. Please click<br/>the link to authenticate your account.
                            </p>
                          </div>
                          {/* Email display — non-editable like Fey */}
                          <div className="w-full flex items-center gap-0 rounded-xl overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.09)" }}>
                            <span className="flex-1 px-4 py-3 text-[14px] text-white/60">{heroAuthEmail}</span>
                            <div className="flex items-center justify-center w-10 h-10 mr-1">
                              {heroOtpVerifying
                                ? <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/><path d="M8 12l2.5 2.5L16 9" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                          </div>
                          {/* OTP input */}
                          <input
                            type="text" inputMode="numeric" maxLength={6} autoFocus
                            disabled={heroOtpVerifying}
                            placeholder="Enter 6-digit code"
                            className="w-full bg-transparent outline-none text-[18px] text-center text-white/80 placeholder:text-white/20 tracking-[0.3em] py-3 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                            onChange={e => {
                              if (heroOtpVerifying) return;
                              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                              setHeroOtpCode(v);
                              if (v.length === 6) void handleHeroOTPVerify(v);
                            }}
                          />
                          {heroAuthError && <p className="text-[11px] text-red-400/80">{heroAuthError}</p>}
                          <button type="button" onClick={() => setHeroAuthStep("email")}
                            className="text-[12px] text-white/30 hover:text-white/55 transition">Back to Login</button>
                        </div>
                      )}

                      {heroAuthStep === "loading" && (
                        <HeroInlineLoading onDone={() => {
                          // If session already exists, go straight to idle — avoids blank screen flash
                          if (session?.user) {
                            setHeroAuthStep("idle");
                          } else {
                            setHeroAuthStep("waiting_session");
                          }
                        }} />
                      )}
                      {heroAuthStep === "waiting_session" && (
                        <div className="flex flex-col items-center gap-3 py-4">
                          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                          <p className="text-[12px] text-white/35">Signing you in…</p>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            )}

            {/* HeroBar — always mounted, hidden during auth so state is preserved */}
            <div style={{ display: ((!session?.user && heroAuthStep !== "idle") || heroAuthStep === "loading" || heroAuthStep === "waiting_session") ? 'none' : undefined }}>
              {mode === "client" ? (
                <div className="space-y-4">
                  <HeroBar
                    mode={mode}
                    onQueryChange={(q) => { setSearchQuery(q); }}
                    onRolesChange={(roles) => { setSelectedRoles(roles); }}
                    onDiscover={openGallery}
                    onRequireSignIn={requireClientSignIn}
                    onAIResults={(ids, _summary) => {
                      setAiHighlightIds(ids);
                      if (ids.length > 0) {
                        setShowTalentGallery(true);
                        setTimeout(() => scrollToRef(galleryRef), 250);
                      }
                    }}
                    showClear={showTalentGallery}
                    onClear={() => {
                      setShowTalentGallery(false);
                      setSearchQuery("");
                      setSelectedRoles([]);
                      setAiHighlightIds([]);
                    }}
                  />

                  <div className="pt-1 w-full flex flex-col items-center">
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
                        "group flex items-center justify-center gap-2 px-4 py-2.5 rounded-full ring-1 transition-all duration-200 text-[12px] text-center max-w-full",
                        showPackages
                          ? "bg-white/[0.08] ring-white/[0.18] text-white/75"
                          : "bg-white/[0.04] ring-white/[0.08] text-white/35 hover:bg-white/[0.07] hover:text-white/60 hover:ring-white/[0.14]"
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-center leading-snug">View pre-vetted, brand-ready teams to deploy</span>
                      <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 transition-transform duration-200", showPackages && "rotate-180")} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <HeroBar
                    mode={mode}
                    onQueryChange={(q) => setSearchQuery(q)}
                    onRolesChange={(roles) => setSelectedRoles(roles)}
                    onDiscover={() => { setHeroAuthStep("email"); setHeroAuthEmail(""); setHeroAuthError(""); setHeroAuthAuthMode("signup"); }}
                    onRequireSignIn={() => { setHeroAuthStep("email"); setHeroAuthEmail(""); setHeroAuthError(""); setHeroAuthAuthMode("signup"); }}
                    onTalentProfileSaved={() => setCreatorOnboardingComplete(true)}
                  />
                </div>
              )}
            </div>
          </div>
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
                talents={displayTalents}
                query={searchQuery}
                selectedRoles={selectedRoles}
                aiHighlightIds={aiHighlightIds}
                selectedPodIds={selectedPodIds}
                selectedPackage={selectedPackage}
                onAddToPod={addToPod}
                onRemoveFromPod={removeFromPod}
                onBook={(talent) => {
                  if (!selectedPodIds.includes(talent.id)) addToPod(talent.id);
                }}
                onTalentClick={(talentId) => {
                  if (selectedPodIds.includes(talentId)) removeFromPod(talentId);
                  else addToPod(talentId);
                }}
                onRoleRequest={(roleId, roleTitle) => {
                  // Pre-fill search + open gallery filtered to that role
                  setSearchQuery(roleTitle);
                  setSelectedRoles([roleTitle]);
                  setShowTalentGallery(true);
                  // If pod already has talent (from "Book now" adding to pod), open brief directly
                  if (selectedPodIds.length > 0) {
                    setTimeout(() => {
                      setShowCampaignBoard(true);
                      scrollToRef(campaignRef);
                    }, 100);
                  } else {
                    setTimeout(() => scrollToRef(galleryRef), 200);
                  }
                  if (!session) setClientAuthOpen(true);
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
                setPendingConfirm(true);
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

      <HiveAuthModal
        open={clientAuthOpen}
        mode="client"
        onClose={() => { setClientAuthOpen(false); setPendingDiscover(false); }}
        onSuccess={() => {
          // Check if there's a stored post-auth redirect (e.g. from "Go to dashboard" after booking)
          const redirect = sessionStorage.getItem("ch_post_auth_redirect");
          if (redirect) {
            sessionStorage.removeItem("ch_post_auth_redirect");
            // Verify session exists before navigating
            fetch('/api/auth/session')
              .then(r => r.json())
              .then(sessionCheck => {
                if (!sessionCheck?.user) {
                  console.warn('[Auth] Session not found before redirect, redirecting anyway...');
                }
              })
              .catch(e => console.warn('[Auth] Session check failed:', e))
              .finally(() => {
                // Use hard navigation to ensure cookies are sent with request
                window.location.assign(redirect);
              });
            return;
          }
          if (pendingConfirm) {
            setShowTalentGallery(true);
            setShowCampaignBoard(true);
            setPendingConfirm(false);
          } else if (pendingDiscover) {
            setShowTalentGallery(true);
            setTimeout(() => scrollToRef(galleryRef), 200);
            setPendingDiscover(false);
          }
        }}
      />

      {/* ─── Discovery flow overlay ─── */}
      {showDiscovery && (
        <ClientDiscoveryFlow
          onComplete={() => {
            setShowDiscovery(false);
            // Pre-populate roles into HeroBar if user selected any
            if (discoveryStore.requestedRoles.length > 0) {
              setSelectedRoles(discoveryStore.requestedRoles);
            }
            setShowTalentGallery(true);
            setShowPackages(true);
            setTimeout(() => scrollToRef(galleryRef, "start"), 300);
          }}
          onAdvisor={() => setShowAdvisorModal(true)}
          initialStep={discoveryStore.currentStep}
        />
      )}

      {/* ─── Advisor request modal ─── */}
      <AdvisorRequestModal
        open={showAdvisorModal}
        onClose={() => setShowAdvisorModal(false)}
        source={showDiscovery ? `discovery_step_${discoveryStore.currentStep}` : "homepage"}
      />

      {/* Bottom dock — always visible; account menu on marketing home when logged in */}
      <BottomDock />
      {session?.user ? <HomeProfileMenu /> : null}
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
