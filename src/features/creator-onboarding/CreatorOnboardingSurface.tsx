"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Loader2,
  Sparkles,
  FileText,
  Users,
  Wand2,
  Target,
  Zap,
  Calendar,
  Megaphone,
  Camera,
  MapPin,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { ONBOARDING_STEPS } from "@/lib/talent-onboarding/steps";
import {
  emptyTalentDraft,
  INDUSTRY_OPTIONS,
  ROLE_OPTIONS,
  type TalentOnboardingDraft,
} from "@/lib/talent-onboarding/types";
import { redirectByRole } from "@/server/authz";
import { useSession } from "next-auth/react";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const ICON_MAP = {
  brief: FileText,
  team: Users,
  wand: Wand2,
  target: Target,
  zap: Zap,
  calendar: Calendar,
  megaphone: Megaphone,
  camera: Camera,
  map: MapPin,
  sparkle: Sparkles,
} as const;

function stripUndefined<T extends Record<string, unknown>>(object: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(object).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export function CreatorOnboardingSurface() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<TalentOnboardingDraft>(emptyTalentDraft);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [multiPick, setMultiPick] = useState<string[]>([]);
  const [rolesPick, setRolesPick] = useState<string[]>([]);
  const [ranked, setRanked] = useState<string[]>([]);
  const [industryQ, setIndustryQ] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<Msg[]>([]);
  const finishingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const inProgress = stepIdx < ONBOARDING_STEPS.length;
  const step = inProgress
    ? ONBOARDING_STEPS[stepIdx]
    : ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
  const progress = inProgress ? (stepIdx + 1) / ONBOARDING_STEPS.length : 1;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, stepIdx]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const pushAssistant = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}-${Math.random()}`, role: "assistant", content },
    ]);
  }, []);

  const pushUser = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}-${Math.random()}`, role: "user", content },
    ]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/onboarding/creator/profile");
        const data = await res.json();
        if (cancelled) return;
        if (data.profile?.onboardingCompletedAt) {
          router.replace("/dashboard/creator");
          return;
        }
        if (data.profile) {
          const p = data.profile;
          setDraft((d) => ({
            ...d,
            name: p.name || d.name,
            skills: p.skills?.length ? p.skills : d.skills,
            primaryRole: p.primaryRole || d.primaryRole,
            location: p.location || d.location,
            instagram: p.instagram || d.instagram,
            portfolioUrl: p.portfolioUrl || d.portfolioUrl,
            bio: p.bio || d.bio,
            yearsExperienceBand: p.yearsExperienceBand || d.yearsExperienceBand,
            rankedIndustries: p.rankedIndustries?.length ? p.rankedIndustries : d.rankedIndustries,
            preferredProjectTypes: p.preferredProjectTypes?.length
              ? p.preferredProjectTypes
              : d.preferredProjectTypes,
            preferredPace: p.preferredPace || d.preferredPace,
            feedbackStyle: p.feedbackStyle || d.feedbackStyle,
            howIWorkBest: p.howIWorkBest || d.howIWorkBest,
            suitedTeamScale: p.suitedTeamScale || d.suitedTeamScale,
            availabilityType: p.availabilityType || d.availabilityType,
            workModeOpenness: p.workModeOpenness || d.workModeOpenness,
            brandFitPreferences: p.brandFitPreferences?.length
              ? p.brandFitPreferences
              : d.brandFitPreferences,
            clientValueStrengths: p.clientValueStrengths?.length
              ? p.clientValueStrengths
              : d.clientValueStrengths,
            teamSetupPreference: p.teamSetupPreference || d.teamSetupPreference,
          }));
        }

        const name = data.profile?.name?.trim() || "";
        const w = await fetch("/api/onboarding/creator/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "welcome", userName: name }),
        });
        const wj = await w.json();
        if (!cancelled && wj.say) pushAssistant(wj.say);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, pushAssistant]);

  const ackThenAdvance = useCallback(
    async (stepId: string, displayAnswer: string, nextDraft: TalentOnboardingDraft) => {
      setLoading(true);
      try {
        const res = await fetch("/api/onboarding/creator/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ack",
            stepId,
            displayAnswer,
            draft: nextDraft,
          }),
        });
        const j = await res.json();
        if (j.say) pushAssistant(j.say);
      } catch {
        pushAssistant("Got it.");
      } finally {
        setLoading(false);
        setStepIdx((i) => i + 1);
        setInput("");
        setMultiPick([]);
      }
    },
    [pushAssistant],
  );

  const finishOnboarding = useCallback(
    async (finalDraft: TalentOnboardingDraft, transcript: { role: string; content: string }[]) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      setLoading(true);
      try {
        const fin = await fetch("/api/onboarding/creator/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "finalize",
            draft: finalDraft,
            transcript,
          }),
        });
        const fj = await fin.json();
        const closing = fj.say || "You're all set.";
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: closing },
        ]);

        const role = (session?.user as { role?: string } | null)?.role;
        const payload = stripUndefined({
          name: finalDraft.name.trim(),
          instagram: finalDraft.instagram.replace(/^@+/, "").trim(),
          bio: finalDraft.bio.trim() || undefined,
          location: finalDraft.location.trim(),
          skills: finalDraft.skills.filter(Boolean).slice(0, 8),
          niches: finalDraft.rankedIndustries,
          portfolioUrl: finalDraft.portfolioUrl.trim() || undefined,
          primaryRole: finalDraft.primaryRole.trim() || undefined,
          rankedIndustries: finalDraft.rankedIndustries.slice(0, 5),
          yearsExperienceBand: finalDraft.yearsExperienceBand || undefined,
          preferredProjectTypes: finalDraft.preferredProjectTypes,
          preferredPace: finalDraft.preferredPace || undefined,
          feedbackStyle: finalDraft.feedbackStyle || undefined,
          howIWorkBest: finalDraft.howIWorkBest || undefined,
          suitedTeamScale: finalDraft.suitedTeamScale || undefined,
          workEnvironmentFit: fj.workEnvironmentFit || undefined,
          availabilityType: finalDraft.availabilityType || undefined,
          workModeOpenness: finalDraft.workModeOpenness || undefined,
          brandFitPreferences: finalDraft.brandFitPreferences,
          clientValueStrengths: finalDraft.clientValueStrengths,
          teamSetupPreference: finalDraft.teamSetupPreference || undefined,
          prismArchetype: fj.prismArchetype || undefined,
          prismArchetypeSecondary: fj.prismArchetypeSecondary || undefined,
          generatedMatchTags: fj.generatedMatchTags ?? [],
          onboardingTranscriptJson: [...transcript, { role: "assistant", content: closing }],
          onboardingAiSummary: fj.onboardingAiSummary || undefined,
          onboardingComplete: true,
        });

        const put = await fetch("/api/onboarding/creator/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!put.ok) {
          const err = await put.json().catch(() => ({}));
          finishingRef.current = false;
          pushAssistant(typeof err.error === "string" ? err.error : "Couldn't save — try again.");
          return;
        }
        router.push(redirectByRole(role));
      } catch {
        finishingRef.current = false;
        pushAssistant("Something failed — please retry.");
      } finally {
        setLoading(false);
      }
    },
    [session?.user, router, pushAssistant],
  );

  const onTextSubmit = () => {
    const text = input.trim();
    if (!text && !step.optional) return;
    const line = text || (step.optional ? "Skip for now" : "");
    if (!line) return;
    pushUser(line);
    const patch: Partial<TalentOnboardingDraft> = {};
    if (step.id === "a_name") patch.name = text;
    else if (step.id === "a_location") patch.location = text;
    else if (step.id === "a_handle") patch.instagram = text.replace(/^@+/, "");
    else if (step.id === "a_portfolio") patch.portfolioUrl = text || "";
    else if (step.id === "a_bio") patch.bio = text;
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      void ackThenAdvance(step.id, line, next);
      return next;
    });
    setInput("");
  };

  const onSingleChip = (label: string, patch: Partial<TalentOnboardingDraft>) => {
    pushUser(label);
    if (step.id === "c_team") {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        const transcriptSoFar = [
          ...messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: label },
        ];
        void (async () => {
          setLoading(true);
          try {
            const res = await fetch("/api/onboarding/creator/assistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "ack",
                stepId: "c_team",
                displayAnswer: label,
                draft: next,
              }),
            });
            const j = await res.json();
            const ackText = j.say || "Perfect.";
            setMessages((prev) => [
              ...prev,
              { id: `a-${Date.now()}`, role: "assistant", content: ackText },
            ]);
            await finishOnboarding(next, [
              ...transcriptSoFar,
              { role: "assistant", content: ackText },
            ]);
          } finally {
            setLoading(false);
          }
        })();
        return next;
      });
      return;
    }
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      void ackThenAdvance(step.id, label, next);
      return next;
    });
  };

  const onSectionContinue = () => {
    pushUser("Continue");
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/onboarding/creator/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ack",
            stepId: step.id,
            displayAnswer: "Continue",
            draft,
          }),
        });
        const j = await res.json();
        if (j.say) pushAssistant(j.say);
      } catch {
        /* noop */
      } finally {
        setLoading(false);
        setStepIdx((i) => i + 1);
      }
    })();
  };

  const onRolesConfirm = () => {
    if (rolesPick.length === 0) return;
    const summary = rolesPick.join(", ");
    pushUser(summary);
    setDraft((prev) => {
      const next = { ...prev, skills: [...rolesPick] };
      void ackThenAdvance("a_roles", summary, next);
      return next;
    });
    setRolesPick([]);
  };

  const onPrimaryConfirm = (label: string) => {
    pushUser(label);
    setDraft((prev) => {
      const next = { ...prev, primaryRole: label };
      void ackThenAdvance("a_primary_role", label, next);
      return next;
    });
  };

  const onMultiConfirm = () => {
    if (multiPick.length === 0) return;
    const summary = multiPick.join(", ");
    pushUser(summary);
    const field = step.id === "c_client_values" ? "clientValueStrengths" : "brandFitPreferences";
    setDraft((prev) => {
      const next = { ...prev, [field]: [...multiPick] } as TalentOnboardingDraft;
      void ackThenAdvance(step.id, summary, next);
      return next;
    });
  };

  const onRankConfirm = () => {
    if (ranked.length !== 5) return;
    const summary = ranked.map((r, i) => `${i + 1}. ${r}`).join(" ");
    pushUser(summary);
    setDraft((prev) => {
      const next = { ...prev, rankedIndustries: [...ranked] };
      void ackThenAdvance("a_industries", summary, next);
      return next;
    });
    setRanked([]);
    setIndustryQ("");
  };

  const toggleMulti = (label: string) => {
    setMultiPick((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const toggleRole = (label: string) => {
    setRolesPick((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const addIndustry = (slug: string) => {
    if (ranked.includes(slug) || ranked.length >= 5) return;
    setRanked((r) => [...r, slug]);
  };

  const moveRank = (index: number, dir: -1 | 1) => {
    setRanked((r) => {
      const next = [...r];
      const j = index + dir;
      if (j < 0 || j >= next.length) return next;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const filteredIndustries = INDUSTRY_OPTIONS.filter((ind) =>
    industryQ ? ind.toLowerCase().includes(industryQ.toLowerCase()) : true,
  );

  useEffect(() => {
    if (step.id === "c_brands" || step.id === "c_client_values") {
      setMultiPick([]);
    }
  }, [step.id]);

  const renderChips = () => {
    if (!inProgress) return null;
    if (step.kind === "section_transition") {
      return (
        <button
          type="button"
          onClick={onSectionContinue}
          className="rounded-full px-4 py-2 text-[12px] transition-all"
          style={{
            background: "rgba(124,92,255,0.20)",
            border: "1px solid rgba(124,92,255,0.35)",
            color: "rgba(196,174,255,0.95)",
          }}
        >
          Continue
        </button>
      );
    }

    if (step.kind === "roles_multi") {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRole(r)}
                className="rounded-full px-3 py-1.5 text-[11px] transition-all"
                style={{
                  background: rolesPick.includes(r)
                    ? "rgba(124,92,255,0.22)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${rolesPick.includes(r) ? "rgba(124,92,255,0.4)" : "rgba(255,255,255,0.09)"}`,
                  color: rolesPick.includes(r) ? "rgba(196,174,255,0.95)" : "rgba(255,255,255,0.42)",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={rolesPick.length === 0 || loading}
            onClick={onRolesConfirm}
            className="w-full rounded-xl py-2.5 text-[13px] font-medium disabled:opacity-40"
            style={{
              background: rolesPick.length ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.06)",
              color: "#07070B",
            }}
          >
            Next
          </button>
        </div>
      );
    }

    if (step.kind === "role_primary") {
      const opts = draft.skills.length ? draft.skills : rolesPick;
      return (
        <div className="flex flex-wrap gap-1.5">
          {opts.map((r) => (
            <button
              key={r}
              type="button"
              disabled={loading}
              onClick={() => onPrimaryConfirm(r)}
              className="rounded-full px-3 py-1.5 text-[11px] transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      );
    }

    if (step.kind === "single" && step.options) {
      return (
        <div className="flex flex-col gap-2">
          {step.options.map((opt) => {
            const Icon = opt.iconKey ? ICON_MAP[opt.iconKey] : null;
            let patch: Partial<TalentOnboardingDraft> = {};
            if (step.id === "a_years") patch.yearsExperienceBand = opt.id;
            else if (step.id === "b_work_best") patch.howIWorkBest = opt.label;
            else if (step.id === "b_work_more") patch.preferredProjectTypes = [opt.label];
            else if (step.id === "b_pace") patch.preferredPace = opt.label;
            else if (step.id === "b_feedback") patch.feedbackStyle = opt.label;
            else if (step.id === "b_suited") patch.suitedTeamScale = opt.label;
            else if (step.id === "b_open") patch.workModeOpenness = opt.label;
            else if (step.id === "b_availability") patch.availabilityType = opt.label;
            else if (step.id === "c_team") patch.teamSetupPreference = opt.label;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={loading}
                onClick={() => onSingleChip(opt.label, patch)}
                className="flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {Icon ? <Icon size={16} className="shrink-0 text-purple-300/50" /> : null}
                <span className="text-[13px] text-white/78">{opt.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (step.kind === "multi" && step.options) {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {step.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleMulti(opt.label)}
                className="rounded-full px-3 py-1.5 text-[11px] transition-all"
                style={{
                  background: multiPick.includes(opt.label)
                    ? "rgba(124,92,255,0.22)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${multiPick.includes(opt.label) ? "rgba(124,92,255,0.4)" : "rgba(255,255,255,0.09)"}`,
                  color: multiPick.includes(opt.label) ? "rgba(196,174,255,0.95)" : "rgba(255,255,255,0.42)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={multiPick.length === 0 || loading}
            onClick={onMultiConfirm}
            className="w-full rounded-xl py-2.5 text-[13px] font-medium disabled:opacity-40"
            style={{
              background: multiPick.length ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.06)",
              color: "#07070B",
            }}
          >
            Next
          </button>
        </div>
      );
    }

    if (step.kind === "rank_industries") {
      return (
        <div className="space-y-3">
          <input
            value={industryQ}
            onChange={(e) => setIndustryQ(e.target.value)}
            placeholder="Search industries…"
            className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.85)",
            }}
          />
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {filteredIndustries.map((ind) => (
              <button
                key={ind}
                type="button"
                disabled={ranked.includes(ind) || ranked.length >= 5}
                onClick={() => addIndustry(ind)}
                className="rounded-full px-2.5 py-1 text-[10px] capitalize disabled:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {ind}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-white/35 uppercase tracking-wider">Top 5 — use arrows to rank</p>
            {ranked.map((ind, idx) => (
              <div
                key={`${ind}-${idx}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.2)" }}
              >
                <GripVertical size={12} className="text-white/20 shrink-0" />
                <span className="text-[12px] text-white/75 flex-1 capitalize">
                  {idx + 1}. {ind}
                </span>
                <button type="button" className="p-0.5 text-white/35" onClick={() => moveRank(idx, -1)}>
                  <ChevronUp size={14} />
                </button>
                <button type="button" className="p-0.5 text-white/35" onClick={() => moveRank(idx, 1)}>
                  <ChevronDown size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={ranked.length !== 5 || loading}
            onClick={onRankConfirm}
            className="w-full rounded-xl py-2.5 text-[13px] font-medium disabled:opacity-40"
            style={{
              background: ranked.length === 5 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.06)",
              color: "#07070B",
            }}
          >
            Save ranking
          </button>
        </div>
      );
    }

    return null;
  };

  const showTextInput = inProgress && step.kind === "text";

  if (booting) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#07070B" }}>
        <Loader2 className="h-8 w-8 animate-spin text-purple-400/50" />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen relative flex flex-col"
      style={{
        background: "#07070B",
        color: "rgba(255,255,255,0.88)",
      }}
    >
      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          "radial-gradient(900px 600px at 30% 15%, rgba(124,92,255,0.10) 0%, transparent 60%), radial-gradient(700px 500px at 70% 80%, rgba(0,220,255,0.05) 0%, transparent 60%)",
      }} />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-10 max-w-lg mx-auto w-full">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-6" style={{ color: "rgba(255,255,255,0.22)" }}>
          Creator Hive · Your fit profile
        </p>

        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="w-full rounded-2xl overflow-hidden mb-4"
          style={{
            background: "rgba(10,10,18,0.92)",
            border: "1px solid rgba(124,92,255,0.30)",
            boxShadow: "0 0 40px rgba(124,92,255,0.12), 0 0 0 1px rgba(124,92,255,0.08)",
          }}
        >
          <div className="h-[2px] w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, rgba(124,92,255,0.8), rgba(93,208,255,0.7))" }}
              animate={{ width: `${Math.max(progress * 100, 6)}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          <div className="px-4 pt-4 pb-3 space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles size={12} className="text-purple-400/70 mt-1 shrink-0" />
              <p
                className="text-[15px] font-semibold leading-snug"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  textShadow: "0 0 20px rgba(167,139,250,0.45)",
                }}
              >
                {inProgress ? step.prompt : "Saving your profile…"}
              </p>
            </div>
            {step.id === "c_intro" && (
              <p className="text-[12px] pl-5" style={{ color: "rgba(255,255,255,0.38)" }}>
                A few more answers help us match you to better-fit briefs.
              </p>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto px-4 pb-2 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${
                    msg.role === "user" ? "bg-white/[0.08] text-white/82" : "text-white/72"
                  }`}
                  style={
                    msg.role === "assistant"
                      ? {
                          background: "rgba(124,92,255,0.08)",
                          border: "1px solid rgba(124,92,255,0.14)",
                        }
                      : undefined
                  }
                >
                  {msg.role === "assistant" && (
                    <Sparkles size={10} className="inline mr-1 text-purple-400/60 mb-0.5" />
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {inProgress && (
            <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: "rgba(124,92,255,0.14)" }}>
              {renderChips()}
              {showTextInput && (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onTextSubmit();
                      }
                    }}
                    placeholder={step.placeholder ?? "Type your answer…"}
                    rows={1}
                    className="flex-1 bg-transparent outline-none text-[13px] text-white/78 placeholder:text-white/20 resize-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={onTextSubmit}
                    disabled={(!input.trim() && !step.optional) || loading}
                    className="flex items-center justify-center w-8 h-8 rounded-xl transition-all disabled:opacity-25"
                    style={{
                      background: input.trim() || step.optional ? "#fff" : "rgba(255,255,255,0.06)",
                      color: "#07070B",
                    }}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
                  </button>
                </div>
              )}
              {step.optional && step.kind === "text" && step.id === "a_portfolio" && (
                <button
                  type="button"
                  className="text-[11px] text-white/35 hover:text-white/55"
                  onClick={() => {
                    pushUser("Skip for now");
                    setDraft((prev) => {
                      const next = { ...prev, portfolioUrl: "" };
                      void ackThenAdvance("a_portfolio", "Skip for now", next);
                      return next;
                    });
                  }}
                >
                  Skip for now
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
