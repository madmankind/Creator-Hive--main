"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TALENT_CREATOR_TYPES,
  TALENT_INTAKE_NAME_QUESTIONS,
  TALENT_INDIVIDUAL_TAIL,
  TALENT_INDUSTRY_OPTIONS,
  TALENT_REP_WHO_QUESTION,
  TALENT_REP_ROOT,
  TALENT_REP_PATH_QUESTION,
  TALENT_T1_FIELDS,
  TALENT_ADD_T2_QUESTION,
  TALENT_T2_FIELDS,
  parseRankedRoles,
  parseRankedIndustries,
  parseChipsMulti,
  type TalentIntakeQuestion,
} from "@/lib/heroTalentIntake";
import { RoleFuzzyMultiPicker } from "@/components/onboarding/RoleFuzzyMultiPicker";
import { ArrowLeft, ArrowUp, Sparkles, MapPin, Briefcase, Clock, MessageCircle } from "lucide-react";

export type TalentIntakeCompleteMeta =
  | { kind: "individual" }
  | { kind: "rep_roster"; fileName?: string }
  | { kind: "rep_manual" };

type FlowMode =
  | { m: "name"; i: number }
  | { m: "ct" }
  | { m: "rep_who" }
  | { m: "rep_root"; i: number }
  | { m: "rep_path" }
  | { m: "rep_roster" }
  | { m: "rep_t1"; i: number }
  | { m: "rep_after_t1" }
  | { m: "rep_t2"; i: number }
  | { m: "ind"; i: number };

function useTypewriter(text: string, speed = 20) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut("");
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }
    if (speed <= 0) {
      setOut(text);
      setDone(true);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { out: out, done };
}

function StepIcon({ qid }: { qid: string }) {
  if (qid.includes("Industries") || qid === "rankedIndustries") return <MapPin size={12} className="text-purple-400/50 shrink-0 mt-1" />;
  if (qid.includes("Role") || qid.includes("topRoles")) return <Briefcase size={12} className="text-purple-400/50 shrink-0 mt-1" />;
  if (qid.includes("pace") || qid === "yearsExperienceBand") return <Clock size={12} className="text-purple-400/50 shrink-0 mt-1" />;
  if (qid.includes("feedback") || qid.includes("open")) return <MessageCircle size={12} className="text-purple-400/50 shrink-0 mt-1" />;
  return null;
}

export function HeroTalentIntakeBar({
  onComplete,
}: {
  onComplete: (draft: Record<string, string>, meta: TalentIntakeCompleteMeta) => void;
}) {
  const [flow, setFlow] = useState<FlowMode>({ m: "name", i: 0 });
  const [creatorType, setCreatorType] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputVal, setInputVal] = useState("");
  const [rankedIndustries, setRankedIndustries] = useState<string[]>([]);
  const [rankedTopRoles, setRankedTopRoles] = useState<string[]>([]);
  const [multiPicks, setMultiPicks] = useState<string[]>([]);
  const [rosterBusy, setRosterBusy] = useState(false);
  const [rosterErr, setRosterErr] = useState<string | null>(null);
  const rosterRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ: TalentIntakeQuestion | null = useMemo(() => {
    if (flow.m === "name") return TALENT_INTAKE_NAME_QUESTIONS[flow.i] ?? null;
    if (flow.m === "ct")
      return { id: "creatorType", prompt: "How do you usually work?", chips: [...TALENT_CREATOR_TYPES] };
    if (flow.m === "rep_who") return TALENT_REP_WHO_QUESTION;
    if (flow.m === "rep_root") return TALENT_REP_ROOT[flow.i] ?? null;
    if (flow.m === "rep_path") return TALENT_REP_PATH_QUESTION;
    if (flow.m === "rep_roster") return null;
    if (flow.m === "rep_t1") return TALENT_T1_FIELDS[flow.i] ?? null;
    if (flow.m === "rep_after_t1") return TALENT_ADD_T2_QUESTION;
    if (flow.m === "rep_t2") return TALENT_T2_FIELDS[flow.i] ?? null;
    if (flow.m === "ind") return TALENT_INDIVIDUAL_TAIL[flow.i] ?? null;
    return null;
  }, [flow]);

  const promptText = currentQ?.prompt ?? (flow.m === "rep_roster" ? "Upload your talent roster (CSV or XLSX). We'll save drafts you can complete later." : "");
  const { out: typedPrompt, done: promptDone } = useTypewriter(promptText, 18);

  useEffect(() => {
    if (promptDone && !currentQ?.industryRank && !currentQ?.roleRank && !currentQ?.chipsMulti)
      setTimeout(() => inputRef.current?.focus(), 80);
  }, [promptDone, currentQ?.id, currentQ?.industryRank, currentQ?.roleRank, currentQ?.chipsMulti]);

  const answerForCurrentPick = currentQ ? answers[currentQ.id] : undefined;
  useEffect(() => {
    if (!currentQ) return;
    if (currentQ.roleRank) setRankedTopRoles(parseRankedRoles(answerForCurrentPick));
    else if (currentQ.industryRank) setRankedIndustries(parseRankedIndustries(answerForCurrentPick));
    else if (currentQ.chipsMulti) setMultiPicks(parseChipsMulti(answerForCurrentPick));
  }, [currentQ, answerForCurrentPick]);

  const estTotal = 3 + 1 + TALENT_INDIVIDUAL_TAIL.length;
  const progressFrac = useMemo(() => {
    if (flow.m === "name") return (flow.i + 1) / estTotal;
    if (flow.m === "ct") return 4 / estTotal;
    if (flow.m === "ind") return (4 + flow.i + 1) / estTotal;
    return 0.5;
  }, [flow, estTotal]);

  const goBack = useCallback(() => {
    setInputVal("");
    setRosterErr(null);
    if (flow.m === "name" && flow.i > 0) setFlow({ m: "name", i: flow.i - 1 });
    else if (flow.m === "ct") setFlow({ m: "name", i: 2 });
    else if (flow.m === "rep_who") setFlow({ m: "ct" });
    else if (flow.m === "rep_root" && flow.i > 0) setFlow({ m: "rep_root", i: flow.i - 1 });
    else if (flow.m === "rep_root" && flow.i === 0) setFlow({ m: "rep_who" });
    else if (flow.m === "rep_path") setFlow({ m: "rep_root", i: TALENT_REP_ROOT.length - 1 });
    else if (flow.m === "rep_t1" && flow.i > 0) setFlow({ m: "rep_t1", i: flow.i - 1 });
    else if (flow.m === "rep_t1" && flow.i === 0) setFlow({ m: "rep_path" });
    else if (flow.m === "rep_after_t1") setFlow({ m: "rep_t1", i: TALENT_T1_FIELDS.length - 1 });
    else if (flow.m === "rep_t2" && flow.i > 0) setFlow({ m: "rep_t2", i: flow.i - 1 });
    else if (flow.m === "rep_t2" && flow.i === 0) setFlow({ m: "rep_after_t1" });
    else if (flow.m === "rep_roster") setFlow({ m: "rep_path" });
    else if (flow.m === "ind" && flow.i > 0) setFlow({ m: "ind", i: flow.i - 1 });
    else if (flow.m === "ind" && flow.i === 0) {
      if (creatorType === "Independent creator") setFlow({ m: "ct" });
      else setFlow({ m: "rep_who" });
    }
  }, [flow, creatorType]);

  const finishIndividual = useCallback(
    (next: Record<string, string>) => {
      onComplete({ ...next, creatorType }, { kind: "individual" });
    },
    [onComplete, creatorType],
  );

  const advance = useCallback(
    (raw: string) => {
      const isSkipChip =
        raw === "Skip" ||
        raw === "Skip — add later" ||
        (Boolean(currentQ?.optional) && raw.startsWith("Skip") && !raw.toLowerCase().includes("save for later"));
      const isSkip = isSkipChip;
      const t = isSkip ? "" : raw.trim();
      if (!isSkip && !t && !currentQ?.optional) return;

      if (flow.m === "name" && currentQ) {
        if (currentQ.id === "displayName" && t.length < 2) return;
        if ((currentQ.id === "firstName" || currentQ.id === "lastName") && t.length < 1) return;
        const next = { ...answers, [currentQ.id]: t };
        setAnswers(next);
        setInputVal("");
        if (flow.i >= 2) setFlow({ m: "ct" });
        else setFlow({ m: "name", i: flow.i + 1 });
        return;
      }

      if (flow.m === "ct") {
        setCreatorType(t);
        setAnswers((a) => ({ ...a, creatorType: t }));
        setInputVal("");
        if (t === "Independent creator") setFlow({ m: "ind", i: 0 });
        else setFlow({ m: "rep_who" });
        return;
      }

      if (flow.m === "rep_who" && currentQ) {
        const next = { ...answers, repSigningMode: t };
        setAnswers(next);
        setInputVal("");
        if (t.includes("Myself")) {
          setFlow({ m: "ind", i: 0 });
        } else {
          setFlow({ m: "rep_root", i: 0 });
        }
        return;
      }

      if (flow.m === "rep_root" && currentQ) {
        const next = { ...answers, [currentQ.id]: t };
        setAnswers(next);
        setInputVal("");
        if (flow.i < TALENT_REP_ROOT.length - 1) setFlow({ m: "rep_root", i: flow.i + 1 });
        else setFlow({ m: "rep_path" });
        return;
      }

      if (flow.m === "rep_path" && currentQ) {
        const next = { ...answers, repOnboardPath: t };
        setAnswers(next);
        setInputVal("");
        if (t.includes("Upload roster")) {
          setFlow({ m: "rep_roster" });
        } else {
          setFlow({ m: "rep_t1", i: 0 });
        }
        return;
      }

      if (flow.m === "rep_t1" && currentQ) {
        if (currentQ.roleRank || currentQ.industryRank || currentQ.chipsMulti) return;
        const next = { ...answers, [currentQ.id]: t };
        setAnswers(next);
        setInputVal("");
        if (flow.i < TALENT_T1_FIELDS.length - 1) setFlow({ m: "rep_t1", i: flow.i + 1 });
        else setFlow({ m: "rep_after_t1" });
        return;
      }

      if (flow.m === "rep_after_t1" && currentQ) {
        setInputVal("");
        if (t.includes("Add Talent 2")) setFlow({ m: "rep_t2", i: 0 });
        else if (t.includes("Done") || t.includes("Skip")) {
          void (async () => {
            try {
              const res = await fetch("/api/onboarding/agency/talent-draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "commit_manual", draft: answers }),
              });
              if (!res.ok) throw new Error("save");
              onComplete({ ...answers, creatorType }, { kind: "rep_manual" });
            } catch {
              setRosterErr("Could not save — try again");
            }
          })();
        }
        return;
      }

      if (flow.m === "rep_t2" && currentQ) {
        if (currentQ.roleRank || currentQ.industryRank || currentQ.chipsMulti) return;
        const next = { ...answers, [currentQ.id]: t };
        setAnswers(next);
        setInputVal("");
        if (flow.i < TALENT_T2_FIELDS.length - 1) setFlow({ m: "rep_t2", i: flow.i + 1 });
        return;
      }

      if (flow.m === "ind" && currentQ) {
        if (currentQ.roleRank) return;
        if (currentQ.industryRank) return;
        if (currentQ.chipsMulti) return;
        const next = { ...answers, [currentQ.id]: t };
        setAnswers(next);
        setInputVal("");
        if (flow.i < TALENT_INDIVIDUAL_TAIL.length - 1) setFlow({ m: "ind", i: flow.i + 1 });
        else finishIndividual(next);
      }
    },
    [flow, answers, currentQ, creatorType, onComplete, finishIndividual],
  );

  const saveRepManual = useCallback(
    async (draft: Record<string, string>) => {
      try {
        const res = await fetch("/api/onboarding/agency/talent-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "commit_manual", draft }),
        });
        if (!res.ok) throw new Error("save");
        onComplete({ ...draft, creatorType }, { kind: "rep_manual" });
      } catch {
        setRosterErr("Could not save — try again");
      }
    },
    [creatorType, onComplete],
  );

  const confirmIndustries = useCallback(() => {
    if (!currentQ?.industryRank) return;
    const m = flow.m;
    if (m !== "ind" && m !== "rep_t1" && m !== "rep_t2") return;
    const next = { ...answers, [currentQ.id]: JSON.stringify(rankedIndustries) };
    setAnswers(next);
    if (m === "ind") {
      setFlow({ m: "ind", i: flow.i + 1 });
      return;
    }
    if (m === "rep_t1") {
      if (flow.i < TALENT_T1_FIELDS.length - 1) setFlow({ m: "rep_t1", i: flow.i + 1 });
      else setFlow({ m: "rep_after_t1" });
      return;
    }
    if (m === "rep_t2") {
      if (flow.i < TALENT_T2_FIELDS.length - 1) setFlow({ m: "rep_t2", i: flow.i + 1 });
      else void saveRepManual({ ...next, creatorType });
    }
  }, [flow, currentQ, answers, rankedIndustries, creatorType, saveRepManual]);

  const confirmChipsMulti = useCallback(() => {
    if (!currentQ?.chipsMulti) return;
    const m = flow.m;
    if (m !== "ind" && m !== "rep_t1" && m !== "rep_t2") return;
    const next = { ...answers, [currentQ.id]: JSON.stringify(multiPicks) };
    setAnswers(next);
    if (m === "ind") {
      setFlow({ m: "ind", i: flow.i + 1 });
      return;
    }
    if (m === "rep_t1") {
      if (flow.i < TALENT_T1_FIELDS.length - 1) setFlow({ m: "rep_t1", i: flow.i + 1 });
      else setFlow({ m: "rep_after_t1" });
      return;
    }
    if (m === "rep_t2") {
      if (flow.i < TALENT_T2_FIELDS.length - 1) setFlow({ m: "rep_t2", i: flow.i + 1 });
      else void saveRepManual({ ...next, creatorType });
    }
  }, [flow, currentQ, answers, multiPicks, creatorType, saveRepManual]);

  const confirmTopRoles = useCallback(() => {
    if (!currentQ?.roleRank) return;
    const m = flow.m;
    if (m !== "ind" && m !== "rep_t1" && m !== "rep_t2") return;
    if (rankedTopRoles.length < 1) return;
    const next = { ...answers, [currentQ.id]: JSON.stringify(rankedTopRoles) };
    setAnswers(next);
    if (m === "ind") {
      setFlow({ m: "ind", i: flow.i + 1 });
      return;
    }
    if (m === "rep_t1") {
      if (flow.i < TALENT_T1_FIELDS.length - 1) setFlow({ m: "rep_t1", i: flow.i + 1 });
      else setFlow({ m: "rep_after_t1" });
      return;
    }
    if (m === "rep_t2") {
      if (flow.i < TALENT_T2_FIELDS.length - 1) setFlow({ m: "rep_t2", i: flow.i + 1 });
      else void saveRepManual({ ...next, creatorType });
    }
  }, [flow, currentQ, answers, rankedTopRoles, creatorType, saveRepManual]);

  const industryMax = currentQ?.industryRank?.max ?? 5;

  const handleRosterFile = useCallback(
    async (file: File) => {
      setRosterBusy(true);
      setRosterErr(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/onboarding/agency/roster-parse", { method: "POST", body: fd });
        const data = (await res.json()) as { error?: string; saved?: number };
        if (!res.ok) throw new Error(data.error ?? "upload");
        await fetch("/api/onboarding/agency/rep-bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityName: answers.repEntityName,
            repName: answers.repContactName,
            repEmail: answers.repEmail,
            repSocial: answers.repSocial,
            talentKinds: answers.repTalentKinds,
          }),
        }).catch(() => {});
        onComplete({ ...answers, creatorType, rosterImported: String(data.saved ?? 0) }, {
          kind: "rep_roster",
          fileName: file.name,
        });
      } catch {
        setRosterErr("Upload failed — use CSV or XLSX");
      } finally {
        setRosterBusy(false);
      }
    },
    [answers, creatorType, onComplete],
  );

  const chips: string[] =
    currentQ && !currentQ.industryRank && !currentQ.roleRank && !currentQ.chipsMulti
      ? [...currentQ.chips]
      : [];
  const discreteChoiceFlow =
    flow.m === "rep_after_t1" || flow.m === "rep_path" || flow.m === "rep_who" || flow.m === "ct";
  const showInput =
    promptDone &&
    flow.m !== "rep_roster" &&
    currentQ &&
    !currentQ.industryRank &&
    !currentQ.roleRank &&
    !currentQ.chipsMulti &&
    !discreteChoiceFlow;

  const canBack = !(flow.m === "name" && flow.i === 0);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (inputVal.trim()) advance(inputVal.trim());
  };

  return (
    <div
      className="w-full rounded-2xl transition-all duration-300 overflow-hidden"
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
          animate={{ width: `${Math.max(progressFrac * 100, 6)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="px-5 pt-4 pb-3 space-y-3">
        {canBack ? (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1 text-[11px] text-white/28 hover:text-white/50 transition"
          >
            <ArrowLeft size={12} /> Back
          </button>
        ) : (
          <div className="h-[18px]" />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${flow.m}-${flow.m === "name" || flow.m === "rep_root" || flow.m === "rep_t1" || flow.m === "rep_t2" || flow.m === "ind" ? flow.i : 0}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-2">
              <Sparkles size={12} className="text-purple-400/70 mt-1 shrink-0" />
              {currentQ ? <StepIcon qid={currentQ.id} /> : null}
              <p
                className="text-[15px] font-semibold leading-snug whitespace-pre-wrap text-left"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  textShadow: "0 0 20px rgba(167,139,250,0.55)",
                  letterSpacing: "-0.01em",
                }}
              >
                {typedPrompt}
                {!promptDone && (
                  <span className="inline-block w-[2px] h-[14px] bg-purple-400/80 animate-pulse ml-0.5 align-middle rounded-full" />
                )}
              </p>
            </div>
            {promptDone &&
            currentQ &&
            (flow.m === "ind" ||
              flow.m === "rep_root" ||
              flow.m === "rep_t1" ||
              flow.m === "rep_t2") ? (
              <p className="text-[10px] text-white/30 mt-2 pl-[22px]">
                {currentQ.chips.length > 0
                  ? "Examples below — type your own answer or mix with chips."
                  : "Type your answer — be specific."}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {flow.m === "rep_roster" && promptDone ? (
          <div className="space-y-2">
            <input ref={rosterRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void handleRosterFile(f);
            }} />
            <button
              type="button"
              disabled={rosterBusy}
              onClick={() => rosterRef.current?.click()}
              className="rounded-full px-4 py-2 text-[12px] font-medium bg-white text-black hover:bg-white/90 disabled:opacity-40"
            >
              {rosterBusy ? "Uploading…" : "Choose roster file"}
            </button>
            {rosterErr ? <p className="text-[11px] text-rose-300/90">{rosterErr}</p> : null}
          </div>
        ) : null}

        {promptDone && currentQ?.roleRank ? (
          <div className="space-y-2">
            <RoleFuzzyMultiPicker
              value={rankedTopRoles}
              onChange={setRankedTopRoles}
              max={currentQ.roleRank.max}
              ordered
              quickChips={currentQ.chips as string[]}
              placeholder="Search roles or add your own…"
            />
            <button
              type="button"
              onClick={confirmTopRoles}
              disabled={rankedTopRoles.length < 1}
              className="rounded-full px-4 py-1.5 text-[11px] font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Continue{rankedTopRoles.length > 0 ? ` (${rankedTopRoles.length}/${currentQ.roleRank.max})` : ""}
            </button>
          </div>
        ) : null}

        {promptDone && currentQ?.industryRank ? (
          <div className="space-y-2">
            <RoleFuzzyMultiPicker
              value={rankedIndustries}
              onChange={setRankedIndustries}
              max={industryMax}
              ordered
              catalog={[...TALENT_INDUSTRY_OPTIONS]}
              quickChips={currentQ.chips as string[]}
              placeholder="Search industries or add your own…"
            />
            <button
              type="button"
              onClick={confirmIndustries}
              disabled={rankedIndustries.length < 1}
              className="rounded-full px-4 py-1.5 text-[11px] font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Continue
              {rankedIndustries.length > 0 ? ` (${rankedIndustries.length}/${industryMax})` : ""}
            </button>
          </div>
        ) : null}

        {promptDone && currentQ?.chipsMulti ? (
          <div className="space-y-2">
            <RoleFuzzyMultiPicker
              value={multiPicks}
              onChange={setMultiPicks}
              max={currentQ.chipsMulti.max}
              ordered={false}
              catalog={currentQ.chips as unknown as string[]}
              quickChips={currentQ.chips as string[]}
              placeholder="Search or type your own…"
            />
            <button
              type="button"
              onClick={confirmChipsMulti}
              className="rounded-full px-4 py-1.5 text-[11px] font-semibold bg-white text-black hover:bg-white/90"
            >
              Continue{multiPicks.length > 0 ? ` (${multiPicks.length} selected)` : ""}
            </button>
          </div>
        ) : null}

        {showInput ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your answer or pick below…"
              className="flex-1 bg-transparent outline-none text-[14px] text-white/80 placeholder:text-white/20"
            />
            {inputVal.trim() ? (
              <button
                type="button"
                onClick={() => advance(inputVal.trim())}
                className="flex items-center justify-center w-7 h-7 rounded-xl bg-white text-black shrink-0 transition hover:bg-white/90"
              >
                <ArrowUp size={13} />
              </button>
            ) : null}
          </div>
        ) : null}

        {promptDone && chips.length > 0 && !currentQ?.industryRank && !currentQ?.roleRank && !currentQ?.chipsMulti ? (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => advance(chip === "Skip" ? "Skip" : chip)}
                className="rounded-full px-3 py-1 text-[11px] transition-all duration-100"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {(flow.m === "rep_path" || flow.m === "rep_root" || flow.m === "rep_who" || flow.m === "rep_roster") && (
        <div
          className="border-t px-5 py-2 flex justify-start"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <button
            type="button"
            onClick={() => {
              setFlow({ m: "rep_roster" });
              setRosterErr(null);
            }}
            className="text-[10px] text-white/28 hover:text-white/48 transition text-left"
          >
            Upload talent roster instead and complete this later
          </button>
        </div>
      )}
    </div>
  );
}
