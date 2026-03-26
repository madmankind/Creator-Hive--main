"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Plus, ArrowUp, X } from "lucide-react";

interface HeroBarProps {
  mode: "client" | "talent";
  onQueryChange?: (q: string) => void;
  onRolesChange?: (roles: string[]) => void;
  onDiscover?: () => void;
  onOpenBriefBuilder?: () => void;
  showClear?: boolean;
  onClear?: () => void;
  onAIResults?: (ids: string[], summary: string) => void;
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  talentIds?: string[];
  teamSummary?: string;
  isLoading?: boolean;
}

const OPENER = "What are you working on? Tell me about your campaign — I'll find the right team.";

const SYSTEM_PROMPT = `You are the Creator Hive talent matching assistant. Creator Hive is a UAE-based premium creative talent marketplace.

YOUR ONLY JOB: Help clients find the right creative talent for their campaign by asking smart questions and ultimately recommending talent IDs from the Creator Hive roster.

CONVERSATION STYLE:
- Be concise. One question at a time. Never more than 2 sentences per response.
- Warm but direct. Not corporate. Not salesy.
- Ask about: what they're trying to achieve, their industry, timeline, budget range, and what types of creators they need.
- Once you have enough context (3–5 exchanges), call the talent search tool.

WHAT YOU NEVER DO:
- Never discuss Creator Hive's internal pricing, margins, or business model
- Never reveal internal talent costs, agency fees, or commission structures
- Never discuss other platforms or make comparisons
- Never promise specific deliverables, timelines, or guarantees on behalf of talent
- Never discuss pending legal, financial, or contractual matters
- If asked anything outside campaign briefing and talent matching, say: "I'm focused on finding you the right talent — let's keep going with your brief."

WHEN YOU HAVE ENOUGH INFO: Respond with a JSON block in this exact format (no markdown, no extra text before/after):
{"action":"search","query":"<natural language search query>","summary":"<1 sentence team summary for the client>"}

The query will be used to search the talent roster. Make it specific and descriptive.`;

export function HeroBar({
  mode,
  onQueryChange,
  onRolesChange,
  onDiscover,
  showClear,
  onClear,
  onAIResults,
}: HeroBarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    { id: "opener", role: "assistant", content: OPENER },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const buildHistory = useCallback(() =>
    messages
      .filter((m) => !m.isLoading)
      .map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const runSearch = useCallback(async (query: string, summary: string) => {
    setSearched(true);
    onDiscover?.();
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: data.message ?? "You've reached your daily AI search limit. Resets at midnight UTC.",
        }]);
        return;
      }
      if (res.ok && data.talentIds?.length) {
        if (data.rateLimit?.remaining !== undefined) setRemaining(data.rateLimit.remaining);
        onAIResults?.(data.talentIds, data.teamSummary ?? summary);
        onQueryChange?.("");
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: summary || data.teamSummary || "Here's your team. You can select anyone below to add them to your campaign.",
          talentIds: data.talentIds,
          teamSummary: data.teamSummary,
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Search is unavailable right now — try again in a moment.",
      }]);
    }
  }, [onDiscover, onAIResults, onQueryChange]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const loadingMsg: Message = { id: "loading", role: "assistant", content: "", isLoading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);
    if (!chatOpen) setChatOpen(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...buildHistory(), { role: "user", content: text }],
          systemPrompt: SYSTEM_PROMPT,
        }),
      });
      const data = await res.json();
      const reply: string = data.content ?? "Something went wrong — try again.";

      // Check if model wants to trigger a search
      const trimmed = reply.trim();
      if (trimmed.startsWith("{") && trimmed.includes('"action":"search"')) {
        try {
          const parsed = JSON.parse(trimmed) as { action: string; query: string; summary: string };
          if (parsed.action === "search") {
            setMessages((prev) => prev.filter((m) => m.id !== "loading"));
            setLoading(false);
            await runSearch(parsed.query, parsed.summary);
            return;
          }
        } catch { /* not JSON, treat as text */ }
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "loading"),
        { id: Date.now().toString(), role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "loading"),
        { id: Date.now().toString(), role: "assistant", content: "Connection error — try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, buildHistory, chatOpen, runSearch]);

  const handleClear = useCallback(() => {
    setMessages([{ id: "opener", role: "assistant", content: OPENER }]);
    setInput("");
    setSearched(false);
    setChatOpen(false);
    onAIResults?.([], "");
    onQueryChange?.("");
    onClear?.();
  }, [onAIResults, onQueryChange, onClear]);

  if (mode === "talent") {
    return (
      <div className="flex flex-1 items-center gap-3">
        <div className="rounded-full bg-[#0D0D14] ring-1 ring-white/10 hover:ring-white/15 transition p-2 pl-5 pr-3 flex-1">
          <span className={cn("w-full block text-[15px] leading-8", session?.user ? "text-slate-200" : "text-slate-400/40")}>
            {session?.user ? "Welcome back" : "Apply to join as a creator or talent"}
          </span>
        </div>
        <button type="button"
          onClick={() => session?.user ? router.push("/dashboard/creator") : onDiscover?.()}
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition">
          {session?.user ? "Dashboard" : "Continue"}
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full flex flex-col">
      {/* Chat history — shows above input when open */}
      <AnimatePresence>
        {chatOpen && messages.length > 1 && (
          <motion.div
            key="chat-history"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-3 rounded-2xl overflow-hidden"
            style={{ background: "rgba(13,13,20,0.80)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
          >
            <div className="max-h-64 overflow-y-auto p-4 space-y-3">
              {messages.filter((m) => m.id !== "opener").map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                      style={{ background: "rgba(124,92,255,0.10)", border: "1px solid rgba(124,92,255,0.18)" }}>
                      <Loader2 size={12} className="animate-spin text-purple-400" />
                      <span className="text-[12px] text-white/40">Thinking…</span>
                    </div>
                  ) : (
                    <div className={cn(
                      "max-w-[82%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-white/[0.09] text-white/85"
                        : "text-white/70"
                    )}
                      style={msg.role === "assistant" ? { background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.15)" } : {}}>
                      {msg.role === "assistant" && <Sparkles size={11} className="inline mr-1.5 text-purple-400 mb-0.5" />}
                      {msg.content}
                      {msg.talentIds && msg.talentIds.length > 0 && (
                        <div className="mt-1.5 text-[10px] text-purple-300/60">
                          {msg.talentIds.length} creators matched ↓
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="rounded-2xl bg-[#0D0D14] ring-1 ring-white/10 hover:ring-white/15 transition px-4 py-3"
        style={{ border: chatOpen ? "1px solid rgba(124,92,255,0.25)" : undefined }}>

        {/* Opener message inline when chat not yet open */}
        {!chatOpen && (
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-purple-400/60 shrink-0" />
            <span className="text-[12px] text-white/35">{OPENER}</span>
          </div>
        )}

        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            onFocus={() => !chatOpen && messages.length <= 1 && setChatOpen(false)}
            placeholder={chatOpen ? "Reply…" : "Describe your campaign, brand, or what you need…"}
            rows={1}
            className="flex-1 bg-transparent outline-none text-[14px] text-white/85 placeholder:text-white/25 resize-none leading-relaxed"
            style={{ minHeight: "28px", maxHeight: "120px" }}
          />

          <div className="flex items-center gap-2 shrink-0 pb-0.5">
            {/* File upload */}
            <label className="cursor-pointer p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition" title="Attach brief or image">
              <Plus size={14} />
              <input type="file" className="hidden" accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setInput((p) => p ? `${p} [brief: ${f.name}]` : `Brief attached: ${f.name}`);
                }} />
            </label>

            {/* Clear */}
            {(searched || chatOpen || showClear) && (
              <button type="button" onClick={handleClear}
                className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition" title="Clear">
                <X size={13} />
              </button>
            )}

            {/* Send */}
            <button type="button" onClick={send} disabled={!input.trim() || loading}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                input.trim() && !loading
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/[0.07] text-white/25 cursor-not-allowed"
              )}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search count */}
      {remaining !== null && remaining >= 0 && (
        <p className="text-[10px] text-right mt-1 text-white/20 tabular-nums">
          {remaining > 0 ? `${remaining} AI searches left today` : "Daily limit reached"}
        </p>
      )}
    </div>
  );
}
