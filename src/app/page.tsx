"use client";

import { useState, useEffect, useLayoutEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroBar } from "@/components/HeroBar";
import { TalentCarousel } from "@/components/marketing/TalentCarousel";
import { BottomDock } from "@/components/nav/BottomDock";
import { HiveAuthModal } from "@/components/auth/HiveAuthModal";
import { PodSetupOverlay } from "@/features/pod-setup/PodSetupOverlay";
import { CampaignSetupBoard } from "@/features/campaign/CampaignSetupBoard";
import { PackageSelector } from "@/features/campaign/PackageSelector";
import { curatedTalent, getTalentDisplayName } from "@/lib/curatedTalent";
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
          className="shrink-0 rounded-full bg-white px-4 sm:px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition min-h-[44px] disabled:opacity-40"
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

  const packageRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const campaignRef = useRef<HTMLElement>(null);

  const { data: session, status: sessionStatus } = useSession();
  const sessionPending = sessionStatus === "loading";
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;
  const isClient = role === "AGENCY";
  const [creatorOnboardingComplete, setCreatorOnboardingComplete] = useState<boolean | null>(null);

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

  // Logged-out talent: one surface — email / OTP (no extra "Apply to join" stub)
  useLayoutEffect(() => {
    if (mode !== "talent" || session?.user || sessionPending) return;
    setHeroAuthStep((s) => (s === "idle" ? "email" : s));
  }, [mode, session?.user, sessionPending]);

  useEffect(() => {
    if (heroAuthStep !== "waiting_session") return;
    if (session?.user) setHeroAuthStep("idle");
  }, [heroAuthStep, session?.user]);

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
    analytics.heroEmailSubmitted(mode);
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

  const selectedTalents = selectedPodIds
    .map((id) => {
      const t = curatedLookup.get(id);
      if (t) {
        return { id: t.id, name: t.displayName ?? getTalentDisplayName(t.name) ?? t.name, primaryRole: t.primaryRole };
      }
      // Fallback for talent IDs not in curatedTalent (e.g. from direct booking links)
      return { id, name: id.replace("talent-", "").replace(/-/g, " "), primaryRole: "Creator" };
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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
        {/* Deep amethyst ambient — matches sign-in page */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[70vh] rounded-full"
            style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #4c1d95 60%, transparent 100%)", filter: "blur(180px)", opacity: 0.13 }} />
        </div>
        <div className="w-full max-w-[760px] mx-auto text-center space-y-6">

          <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/[0.09]">
            {(["client", "talent"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  persistHeroIntent(m);
                  setHeroSignInNotice(null);
                  setMode(m);
                  if (!session?.user) {
                    setHeroAuthStep("email");
                    setHeroAuthEmail("");
                    setHeroAuthError("");
                    setHeroAuthAuthMode("signup");
                  } else {
                    setHeroAuthStep("idle");
                  }
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
            <AnimatePresence mode="wait">
              {sessionPending && mode === "talent" ? (
                <motion.div
                  key="talent-session-pending"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <div
                    className="w-full h-14 rounded-2xl animate-pulse"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  />
                </motion.div>
              ) : !session?.user && heroAuthStep !== "idle" ? (
                <motion.div
                  key="hero-auth"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="w-full space-y-4"
                >
                  {heroAuthStep === "email" && (
                    <>
                      {/* Email pill + Continue — full width on mobile */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 hover:ring-white/15 transition p-2 pl-4 sm:pl-5 flex-1 flex items-center min-h-[48px]">
                          <input
                            type="email"
                            value={heroAuthEmail}
                            onChange={e => setHeroAuthEmail(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleHeroEmailSubmit(); }}
                            placeholder="account email"
                            autoFocus
                            className="flex-1 bg-transparent outline-none text-[15px] leading-8 text-slate-200 placeholder:text-slate-400/40 min-w-0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleHeroEmailSubmit}
                          disabled={!heroAuthEmail.trim() || heroAuthSubmitting}
                          className="shrink-0 rounded-full bg-white px-4 sm:px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition min-h-[44px]"
                        >
                          {heroAuthSubmitting ? "…" : "Continue"}
                        </button>
                      </div>
                      {heroAuthError && (
                        <p className="text-[12px] text-center text-red-400/80">{heroAuthError}</p>
                      )}
                      {/* Social options — stack on narrow screens */}
                      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={handleHeroGoogleClick}
                          disabled={heroAuthGoogleLoading}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2 rounded-full text-[13px] transition-all min-h-[44px]"
                          style={{ border: "1px solid rgba(255,255,255,0.12)", color: heroAuthGoogleLoading ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.60)" }}
                          onMouseEnter={e => { if (!heroAuthGoogleLoading) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {heroAuthGoogleLoading
                            ? <span className="block w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                            : <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.082 17.64 11.836 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                          }
                          {heroAuthGoogleLoading ? "Connecting…" : "Continue with Google"}
                        </button>
                        {mode === "talent" && (
                          <button
                            type="button"
                            onClick={() => setHeroAuthStep("phone")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2 rounded-full text-[13px] transition-all min-h-[44px]"
                            style={{ border: "1px solid rgba(37,211,102,0.30)", color: "rgba(255,255,255,0.60)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,211,102,0.50)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,211,102,0.30)"; }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/></svg>
                            Continue with WhatsApp
                          </button>
                        )}
                      </div>
                      <p className="text-[12px] text-center text-white/28">
                        {heroAuthAuthMode === "signup" ? "Have an account? " : "New here? "}
                        <button
                          type="button"
                          onClick={() => setHeroAuthAuthMode(heroAuthAuthMode === "signup" ? "login" : "signup")}
                          className="underline underline-offset-2 text-white/55 hover:text-white/75 transition"
                        >
                          {heroAuthAuthMode === "signup" ? "Log in" : "Sign up"}
                        </button>
                      </p>
                    </>
                  )}
                  {heroAuthStep === "phone" && (
                    <HeroPhoneStep
                      onSubmit={handleHeroPhoneSubmit}
                      onBack={() => setHeroAuthStep("email")}
                    />
                  )}
                  {heroAuthStep === "otp" && (
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-[13px] text-white/45">
                        {heroAuthOtpVia === "whatsapp"
                          ? <>Code sent to your WhatsApp at <span className="text-white/65">{heroAuthPhone}</span></>
                          : <>Code sent to <span className="text-white/65">{heroAuthEmail}</span></>
                        }
                      </p>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "rounded-full bg-[#0D0D14] ring-1 ring-white/10 p-2 pl-6 pr-6 flex items-center justify-center w-[220px] sm:w-64 min-h-[52px]",
                          heroOtpVerifying && "opacity-50 pointer-events-none"
                        )}>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            autoFocus
                            disabled={heroOtpVerifying}
                            placeholder="000 000"
                            className="w-full bg-transparent outline-none text-[22px] text-center text-slate-200 placeholder:text-slate-400/25 tracking-[0.4em] leading-8"
                            onChange={e => {
                              if (heroOtpVerifying) return;
                              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                              setHeroOtpCode(v);
                              if (v.length === 6) void handleHeroOTPVerify(v);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setHeroAuthStep(heroAuthOtpVia === "whatsapp" ? "phone" : "email")}
                          disabled={heroOtpVerifying}
                          className="text-[12px] text-white/30 hover:text-white/55 transition px-3 py-2 disabled:opacity-40"
                        >
                          ← Back
                        </button>
                      </div>
                      {heroAuthError && (
                        <p className="text-[12px] text-center text-red-400/80">{heroAuthError}</p>
                      )}
                      {heroOtpVerifying && (
                        <p className="text-[12px] text-center text-white/35">Verifying…</p>
                      )}
                    </div>
                  )}
                  {heroAuthStep === "loading" && (
                    <HeroInlineLoading
                      onDone={() => {
                        if (mode === "talent") setHeroAuthStep("waiting_session");
                        else setHeroAuthStep("idle");
                      }}
                    />
                  )}
                  {heroAuthStep === "waiting_session" && (
                    <div
                      className="w-full max-w-[760px] mx-auto h-14 rounded-2xl animate-pulse"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    />
                  )}
                </motion.div>
              ) : mode === "client" ? (
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
                    onQueryChange={(q) => { setSearchQuery(q); }}
                    onRolesChange={(roles) => { setSelectedRoles(roles); }}
                    onDiscover={openGallery}
                    onAIResults={(ids, _summary) => { setAiHighlightIds(ids); }}
                    showClear={showTalentGallery}
                    onClear={() => {
                      setShowTalentGallery(false);
                      setSearchQuery("");
                      setSelectedRoles([]);
                      setAiHighlightIds([]);
                    }}
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
              ) : (
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
                    onDiscover={() => { setHeroAuthStep("email"); setHeroAuthEmail(""); setHeroAuthError(""); setHeroAuthAuthMode("signup"); }}
                    onTalentProfileSaved={() => setCreatorOnboardingComplete(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
                talents={curatedTalent}
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
