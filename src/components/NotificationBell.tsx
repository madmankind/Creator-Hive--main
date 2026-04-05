"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Notification = {
  id: string; type: string; title: string; message: string;
  isRead: boolean; campaignId: string | null; createdAt: string;
  data?: Record<string, unknown>;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const load = () => {
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : { notifications: [], unreadCount: 0 })
      .then(d => { setNotifs(d.notifications ?? []); setUnread(d.unreadCount ?? 0); });
  };

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnread(0);
    setNotifs(p => p.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifs(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(p => Math.max(0, p - 1));
  };

  const TYPE_ICON: Record<string, string> = {
    talent_replaced: "🔄", talent_added: "✅", talent_removed: "❌",
    campaign_message: "💬", campaign_update: "📋", replacement_proposed: "🔄",
    booking_confirmed: "✅",
  };

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/[0.08]">
        <Bell size={16} className="text-white/60" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-[360px] z-50 rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl"
            style={{ background: "#0F1118" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-[13px] font-semibold text-white/80">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <Check size={10} /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}><X size={14} className="text-white/30 hover:text-white/60" /></button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="px-4 py-10 text-center text-[12px] text-white/25">No notifications yet</div>
              ) : notifs.map(n => (
                <div key={n.id}
                  className={"flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.04] cursor-pointer transition-colors " + (n.isRead ? "hover:bg-white/[0.02]" : "bg-purple-500/[0.06] hover:bg-purple-500/[0.09]")}
                  onClick={() => {
                    markRead(n.id);
                    if (n.type === "talent_replaced" || n.type === "replacement_proposed") {
                      router.push(`/dashboard/campaigns?campaignId=${n.campaignId}&tab=manage`);
                    } else if (n.campaignId) {
                      router.push(`/dashboard/campaigns?campaignId=${n.campaignId}`);
                    }
                    setOpen(false);
                  }}>
                  <span className="text-[18px] flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-medium text-white/85 truncate">{n.title}</p>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-white/20 mt-1">{new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {n.campaignId && <ArrowRight size={12} className="text-white/20 flex-shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
