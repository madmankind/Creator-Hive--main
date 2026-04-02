"use client";

/**
 * CHANGELOG:
 * - Removed "Execution Hub" header text to reclaim vertical space
 * - Converted "Today's outcome" strip to compact colored pills/chips
 * - Reduced header padding from 10px to 12px bottom only
 * - Panel cards retain their functional titles (Attention/Blockers, etc.)
 */

import { useEffect, useMemo, useState } from "react";
import type { TalentCampaignCard } from "@/components/campaigns/types";
import { feyTokens } from "@/lib/fey-design-tokens";
import {
  AlertCircle,
  Clock,
  Bell,
  Folder,
  CreditCard,
  FileText,
  Link2,
  MessageSquare,
  CheckCircle2,
  Check,
  User,
  Calendar,
  Send,
  ExternalLink,
} from "lucide-react";
import { Modal } from "./Modal";
import type { Task, ActivityLog, Resource, ChecklistTemplate } from "@/lib/types/execution";

interface ExecutionHubPanelProps {
  cards: TalentCampaignCard[];
  campaignName?: string;
  campaignId?: string; // For fetching real tasks
}

function safeParseDate(d: string): Date | null {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function estimateDueAt(createdAtIso: string): Date | null {
  const createdAt = safeParseDate(createdAtIso);
  if (!createdAt) return null;
  const dueAt = new Date(createdAt);
  dueAt.setDate(dueAt.getDate() + 7);
  return dueAt;
}

function buildDerivedExecutionData(cards: TalentCampaignCard[]) {
  const attention: Task[] = [];
  const nextUp: Task[] = [];
  const updates: ActivityLog[] = [];
  const resources: Resource[] = [];

  for (const card of cards) {
    const createdAt = safeParseDate(card.createdAt) ?? new Date();
    const dueAt = estimateDueAt(card.createdAt);

    const hasNeedsRevision = card.deliverables.some((d) => d.status === "NeedsRevision");
    const hasContract = Boolean(card.contractId);

    // Booking confirmations are the earliest gating step.
    if (card.bookingState === "PENDING") {
      nextUp.push({
        id: `task-${card.id}-confirm-booking`,
        campaignId: card.campaignId,
        deliverableId: undefined,
        type: "contract",
        title: "Confirm booking",
        description: "Verify the booking invitation is acknowledged.",
        status: "open",
        priority: "medium",
        dueAt: dueAt ?? null,
        assigneeId: undefined,
        relatedEntityId: card.contractId ?? undefined,
        dependencies: [],
        createdAt,
        updatedAt: new Date(),
      });
    }

    if (!hasContract) {
      attention.push({
        id: `task-${card.id}-contract-pending`,
        campaignId: card.campaignId,
        deliverableId: undefined,
        type: "contract",
        title: "Contract pending signature",
        description: "Wait for contract signatures before billing milestones.",
        status: "blocked",
        priority: "urgent",
        dueAt: dueAt ?? null,
        assigneeId: undefined,
        relatedEntityId: undefined,
        dependencies: [],
        createdAt,
        updatedAt: new Date(),
      });
    }

    // Deliverable review gate.
    if (hasNeedsRevision) {
      attention.push({
        id: `task-${card.id}-review-deliverable`,
        campaignId: card.campaignId,
        deliverableId: undefined,
        type: "review",
        title: "Review deliverable",
        description: "Changes requested — review and approve/resubmit.",
        status: "blocked",
        priority: "urgent",
        dueAt: dueAt ?? null,
        assigneeId: undefined,
        relatedEntityId: card.contractId ?? undefined,
        dependencies: [],
        createdAt,
        updatedAt: new Date(),
      });
    }

    // Approval gate (even if deliverables are placeholders, the card status drives intent).
    if (card.status === "SUBMITTED") {
      nextUp.push({
        id: `task-${card.id}-approve-deliverable`,
        campaignId: card.campaignId,
        deliverableId: undefined,
        type: "delivery",
        title: "Approve deliverable",
        description: "Review submitted work and approve for release.",
        status: "open",
        priority: "medium",
        dueAt: dueAt ?? null,
        assigneeId: undefined,
        relatedEntityId: card.contractId ?? undefined,
        dependencies: [],
        createdAt,
        updatedAt: new Date(),
      });
    }

    // Deposit / release gates based on payment status.
    if (card.paymentStatus === "UNFUNDED" && card.status === "APPROVED") {
      attention.push({
        id: `task-${card.id}-secure-deposit`,
        campaignId: card.campaignId,
        deliverableId: undefined,
        type: "payment",
        title: "Secure deposit",
        description: "Funds are required before production can progress fully.",
        status: "blocked",
        priority: "urgent",
        dueAt: dueAt ?? null,
        assigneeId: undefined,
        relatedEntityId: card.contractId ?? undefined,
        dependencies: [],
        createdAt,
        updatedAt: new Date(),
      });
    }

    if (card.paymentStatus === "FUNDED" || card.paymentStatus === "PARTIALLY_FUNDED") {
      nextUp.push({
        id: `task-${card.id}-release-payment`,
        campaignId: card.campaignId,
        deliverableId: undefined,
        type: "payment",
        title: "Release payment",
        description: "Release the next milestone to the talent.",
        status: "open",
        priority: "medium",
        dueAt: dueAt ?? null,
        assigneeId: undefined,
        relatedEntityId: card.contractId ?? undefined,
        dependencies: [],
        createdAt,
        updatedAt: new Date(),
      });
    }
  }

  return {
    attention,
    nextUp,
    updates,
    resources,
    checklist: null as unknown as {
      template: ChecklistTemplate;
      completionPercent: number;
      nextAction?: { title: string };
    } | null,
  };
}

export function ExecutionHubPanel({ cards, campaignName, campaignId }: ExecutionHubPanelProps) {
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string>(() => {
    try {
      return localStorage.getItem("manage_whatsapp_link") || "";
    } catch {
      return "";
    }
  });
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [driveLink, setDriveLink] = useState<string>(() => {
    try {
      return localStorage.getItem("manage_drive_link") || "";
    } catch {
      return "";
    }
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [taskOverrides, setTaskOverrides] = useState<Record<string, Task>>({});

  useEffect(() => {
    setTaskOverrides({});
    setSelectedTask(null);
  }, [cards, campaignId]);

  const executionData = useMemo(() => {
    const derived = buildDerivedExecutionData(cards);
    const merge = (list: Task[]) => list.map((t) => taskOverrides[t.id] ?? t);
    return {
      ...derived,
      attention: merge(derived.attention),
      nextUp: merge(derived.nextUp),
    };
  }, [cards, taskOverrides]);

  const totalDeliverables = cards.reduce((sum, c) => sum + (c.deliverables?.length ?? 0), 0);

  const PanelCard = ({
    title,
    icon,
    accent,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    accent: string;
    children: React.ReactNode;
  }) => (
    <div
      className="rounded-none p-4 flex flex-col min-w-0"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "none",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div style={{ color: accent }}>{icon}</div>
          <div className="text-[13px] font-semibold truncate" style={{ color: feyTokens.colors.text.primary }}>
            {title}
          </div>
        </div>
      </div>
      {children}
    </div>
  );

  const TaskRow = ({ task, onAction }: { task: Task; onAction: (action: string, task: Task) => void }) => {
    const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status !== "completed";
    const dueDateStr = task.dueAt ? new Date(task.dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

    return (
      <div
        className="flex items-center justify-between gap-2 p-2 rounded-none transition-colors cursor-pointer"
        style={{
          background: isOverdue ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${isOverdue ? "rgba(245,158,11,0.20)" : "rgba(255,255,255,0.10)"}`,
        }}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[11px] truncate" style={{ color: feyTokens.colors.text.secondary }}>
            {task.title}
          </div>
          {dueDateStr && (
            <div className="text-[9px] mt-0.5" style={{ color: feyTokens.colors.text.muted }}>
              Due {dueDateStr}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction("complete", task);
            }}
            className="p-1 rounded-[6px] transition-colors"
            style={{
              background: "rgba(16,185,129,0.12)",
              color: "#10B981",
            }}
            title="Mark done"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction("ping", task);
            }}
            className="p-1 rounded-[6px] transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: feyTokens.colors.text.muted,
            }}
            title="Ping"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  const handleTaskAction = (action: string, task: Task) => {
    switch (action) {
      case "complete":
        setTaskOverrides((prev) => ({
          ...prev,
          [task.id]: {
            ...task,
            status: "completed",
            completedAt: new Date(),
            completedBy: "ui",
            updatedAt: new Date(),
          },
        }));
        break;
      case "ping":
        setSelectedTask(task);
        setIsWhatsappOpen(true);
        break;
      case "assign":
        setSelectedTask(task);
        break;
      case "due":
        setSelectedTask(task);
        break;
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Compact outcome strip (no large header) */}
      <div
        style={{
          flex: "0 0 auto",
          paddingBottom: "12px",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="rounded-[8px] px-2.5 py-1 text-[10px] font-medium"
            style={{
              background: "rgba(245,158,11,0.12)",
              color: "#F59E0B",
            }}
          >
            Blockers: {executionData.attention.length}
          </div>
          <div
            className="rounded-[8px] px-2.5 py-1 text-[10px] font-medium"
            style={{
              background: "rgba(120,210,255,0.12)",
              color: "rgba(120,210,255,0.92)",
            }}
          >
            Due soon: {executionData.nextUp.length}
          </div>
          <div
            className="rounded-[8px] px-2.5 py-1 text-[10px] font-medium"
            style={{
              background: "rgba(16,185,129,0.12)",
              color: "#10B981",
            }}
          >
            Updates: {executionData.updates.length}
          </div>
          {cards.length === 0 && (
            <div
              className="rounded-[8px] px-2.5 py-1 text-[10px] font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
            >
              Add creators to see tasks
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content area (flex: 1, scrolls internally) */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide" style={{ paddingRight: "2px" }}>
        {/* Deliverables breakdown */}
        {totalDeliverables > 0 && (
          <div className="mb-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-3.5 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                Deliverables — {totalDeliverables} total
              </span>
            </div>
            <div className="px-3.5 py-2.5 space-y-2">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                      {(card.talentName ?? "C")[0]}
                    </div>
                    <span className="text-[11px] text-white/60">{card.talentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.deliverables.map((d) => (
                      <span key={d.id} className="text-[10px] px-2 py-0.5 rounded-md" style={{
                        background: d.status === "Approved" ? "rgba(16,185,129,0.12)" : d.status === "Pending" ? "rgba(255,255,255,0.05)" : "rgba(245,158,11,0.12)",
                        color: d.status === "Approved" ? "#10B981" : d.status === "Pending" ? "rgba(255,255,255,0.4)" : "#F59E0B",
                      }}>
                        {d.type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <PanelCard title="Attention / Blockers" icon={<AlertCircle className="h-4 w-4" />} accent="#F59E0B">
            <div className="space-y-2 flex-1 min-h-0">
              {executionData.attention.length > 0 ? (
                executionData.attention.slice(0, 3).map((task) => (
                  <TaskRow key={task.id} task={task} onAction={handleTaskAction} />
                ))
              ) : (
                <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                  All clear
                </div>
              )}
            </div>
            {executionData.attention.length > 3 && (
              <div className="mt-3 text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                View all ({executionData.attention.length})
              </div>
            )}
          </PanelCard>

          <PanelCard title="Next Up" icon={<Clock className="h-4 w-4" />} accent="rgba(120,210,255,0.92)">
            <div className="space-y-2 flex-1 min-h-0">
              {executionData.nextUp.length > 0 ? (
                executionData.nextUp.slice(0, 3).map((task) => (
                  <TaskRow key={task.id} task={task} onAction={handleTaskAction} />
                ))
              ) : (
                <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                  All clear
                </div>
              )}
            </div>
            {executionData.nextUp.length > 3 && (
              <div className="mt-3 text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                View all ({executionData.nextUp.length})
              </div>
            )}
          </PanelCard>

          <PanelCard title="Updates" icon={<Bell className="h-4 w-4" />} accent="rgba(155,130,255,0.92)">
            <div className="space-y-2 flex-1 min-h-0">
              {executionData.updates.length > 0 ? (
                executionData.updates.slice(0, 3).map((log) => (
                  <div key={log.id} className="text-[10px]" style={{ color: feyTokens.colors.text.secondary }}>
                    {log.userName}: {log.action}
                  </div>
                ))
              ) : (
                <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                  No updates
                </div>
              )}
            </div>
          </PanelCard>

          <PanelCard title="Assets & Links" icon={<Folder className="h-4 w-4" />} accent="rgba(16,185,129,0.92)">
            <div className="space-y-2 flex-1 min-h-0">
              {executionData.resources.length > 0 ? (
                executionData.resources.slice(0, 3).map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between gap-2 p-2 rounded-[10px]" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[11px] truncate" style={{ color: feyTokens.colors.text.secondary }}>
                      {resource.title}
                    </div>
                    <button
                      onClick={() => resource.url && window.open(resource.url, "_blank")}
                      className="p-1 rounded-[6px]"
                      style={{ background: "rgba(255,255,255,0.06)", color: feyTokens.colors.text.muted }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                  No resources
                </div>
              )}
            </div>
          </PanelCard>
        </div>

        {/* Campaign Execution Checklist */}
        {executionData.checklist && (
          <PanelCard
            title="Execution Checklist"
            icon={<CheckCircle2 className="h-4 w-4" />}
            accent="rgba(255,255,255,0.75)"
          >
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px]" style={{ color: feyTokens.colors.text.muted }}>
                  {executionData.checklist.completionPercent}% complete
                </div>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${executionData.checklist.completionPercent}%`,
                    background: "#10B981",
                  }}
                />
              </div>
            </div>
            {executionData.checklist?.nextAction && (
              <div className="text-[10px] mt-2" style={{ color: feyTokens.colors.text.secondary }}>
                Next: {executionData.checklist.nextAction.title}
              </div>
            )}
          </PanelCard>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title={selectedTask.title}>
          <div className="space-y-3">
            <div className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
              {selectedTask.description || "No description"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTaskAction("complete", selectedTask)}
                className="rounded-full px-3 py-2 text-[12px] font-medium"
                style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
              >
                Mark done
              </button>
              <button
                onClick={() => handleTaskAction("assign", selectedTask)}
                className="rounded-full px-3 py-2 text-[12px] font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: feyTokens.colors.text.secondary }}
              >
                Assign
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Existing modals */}
      <Modal
        open={isWhatsappOpen}
        onClose={() => setIsWhatsappOpen(false)}
        title="Link WhatsApp thread"
      >
        <div className="space-y-3">
          <div className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
            Paste a WhatsApp deep link (`wa.me` or WhatsApp URL). Stored locally for now.
          </div>
          <input
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
            placeholder="https://wa.me/..."
            className="w-full rounded-[12px] px-3 py-2 text-[13px] outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.90)",
            }}
          />
          <div className="flex gap-2">
            <button
              className="rounded-full px-3 py-2 text-[12px] font-medium"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.90)" }}
              onClick={() => {
                const msg = encodeURIComponent(`Re: ${campaignName || "Campaign"} — quick update?`);
                const url = `https://wa.me/?text=${msg}`;
                setWhatsappLink(url);
              }}
            >
              Generate wa.me link
            </button>
            <button
              className="rounded-full px-3 py-2 text-[12px] font-medium"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.72)" }}
              onClick={() => {
                try {
                  localStorage.setItem("manage_whatsapp_link", whatsappLink);
                } catch {}
                setIsWhatsappOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={isAssetsOpen} onClose={() => setIsAssetsOpen(false)} title="Upload assets">
        <div className="space-y-3">
          <div className="text-[12px]" style={{ color: feyTokens.colors.text.muted }}>
            Fast placeholder: store a Drive folder link for this campaign. (Upload UI coming soon.)
          </div>
          <input
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-[12px] px-3 py-2 text-[13px] outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.90)",
            }}
          />
          <div className="flex gap-2">
            <button
              className="rounded-full px-3 py-2 text-[12px] font-medium"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.90)" }}
              onClick={() => {
                try {
                  navigator.clipboard?.writeText(driveLink);
                } catch {}
              }}
            >
              Copy link
            </button>
            <button
              className="rounded-full px-3 py-2 text-[12px] font-medium"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.72)" }}
              onClick={() => {
                try {
                  localStorage.setItem("manage_drive_link", driveLink);
                } catch {}
                setIsAssetsOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
