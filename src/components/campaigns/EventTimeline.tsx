"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";

interface EventTimelineProps {
  campaignIds: string[];
}

interface TimelineEvent {
  id: string;
  type: "started" | "talentAdded" | "deliverableApproved" | "campaignLive" | "invoiceSent" | "paymentCompleted" | "scopeUpdated";
  date: Date | string;
  label: string;
  note?: string;
}

export function EventTimeline({ campaignIds }: EventTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvents, setEditedEvents] = useState<TimelineEvent[]>([]);

  // Load from localStorage or use mock
  useEffect(() => {
    const storageKey = `campaign_events_${campaignIds.join("_")}`;
    const activeCampaignId = campaignIds[0];

    const applyEvents = (evts: TimelineEvent[]) => {
      setEvents(evts);
      setEditedEvents(evts);
    };

    const buildMock = (): TimelineEvent[] => [
      { id: "1",   type: "started",              date: new Date(Date.now() - 7 * 86400000), label: "Campaign started" },
      { id: "2",   type: "talentAdded",           date: new Date(Date.now() - 5 * 86400000), label: "Talent added" },
      { id: "3",   type: "deliverableApproved",   date: new Date(Date.now() - 3 * 86400000), label: "Deliverable approved" },
      { id: "3.5", type: "campaignLive",          date: new Date(Date.now() - 2.5 * 86400000), label: "Campaign live" },
      { id: "4",   type: "invoiceSent",           date: new Date(Date.now() - 2 * 86400000), label: "Invoice sent" },
      { id: "5",   type: "paymentCompleted",      date: new Date(Date.now() - 1 * 86400000), label: "Payment completed" },
    ];

    // Try to fetch real data from API
    // TODO: wire to real data — CampaignTalent and Invoice records
    const fetchRealEvents = async (): Promise<TimelineEvent[] | null> => {
      if (!activeCampaignId) return null;
      try {
        const res = await fetch(`/api/campaigns/${activeCampaignId}`);
        if (!res.ok) return null;
        const data = await res.json();
        const campaign = data.campaign;
        if (!campaign) return null;

        const realEvents: TimelineEvent[] = [];

        // Real event: campaign created
        if (campaign.createdAt) {
          realEvents.push({
            id: "real-created",
            type: "started",
            date: new Date(campaign.createdAt),
            label: "Campaign created",
          });
        }

        // Real event: each talent assigned
        if (Array.isArray(campaign.talents)) {
          for (const t of campaign.talents) {
            if (t.assignedAt || t.createdAt) {
              realEvents.push({
                id: `real-talent-${t.talentId ?? t.id}`,
                type: "talentAdded",
                date: new Date(t.assignedAt ?? t.createdAt),
                label: `${t.talent?.name ?? "Talent"} added`,
              });
            }
          }
        }

        // Real event: brief sent
        if (campaign.campaignBrief?.sentAt) {
          realEvents.push({
            id: "real-brief-sent",
            type: "campaignLive",
            date: new Date(campaign.campaignBrief.sentAt),
            label: "Brief sent to talent",
          });
        }

        return realEvents.length > 0 ? realEvents : null;
      } catch {
        return null;
      }
    };

    // Check localStorage first for user-edited events
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        applyEvents(parsed.map((e: TimelineEvent & { date: string }) => ({ ...e, date: new Date(e.date) })));
        return;
      } catch { /* fall through */ }
    }

    // Fetch real events, fall back to mock
    fetchRealEvents().then((real) => applyEvents(real ?? buildMock()));
  }, [campaignIds]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedEvents([...events]);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEvents([...events]);
  };

  const handleSave = () => {
    setEvents([...editedEvents]);
    const storageKey = `campaign_events_${campaignIds.join("_")}`;
    localStorage.setItem(storageKey, JSON.stringify(editedEvents));
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setEditedEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleAdd = () => {
    const newEvent: TimelineEvent = {
      id: `new-${Date.now()}`,
      type: "started",
      date: new Date(),
      label: "New event",
    };
    setEditedEvents([...editedEvents, newEvent]);
  };

  const updateEvent = (id: string, field: keyof TimelineEvent, value: string | Date) => {
    setEditedEvents(prev =>
      prev.map(e => e.id === id ? { ...e, [field]: value } : e)
    );
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    // Reduced saturation to match Fey's muted indicators
    switch (type) {
      case "started":
        return "rgba(255,255,255,0.35)";
      case "talentAdded":
        return "rgba(255,255,255,0.30)";
      case "deliverableApproved":
        return "rgba(255,255,255,0.40)";
      case "campaignLive":
        return "rgba(255,255,255,0.35)";
      case "invoiceSent":
        return "rgba(255,255,255,0.30)";
      case "paymentCompleted":
        return "rgba(255,255,255,0.40)";
      case "scopeUpdated":
        return "rgba(255,255,255,0.40)";
      default:
        return feyTokens.colors.text.muted;
    }
  };

  const isPast = (date: Date | string) => {
    const eventDate = typeof date === "string" ? new Date(date) : date;
    return eventDate < new Date();
  };

  // Determine event status for glow
  const getEventStatus = (event: TimelineEvent, index: number, sortedEvents: TimelineEvent[]) => {
    const eventDate = typeof event.date === "string" ? new Date(event.date) : event.date;
    const now = new Date();
    const isEventPast = eventDate < now;
    
    // Find "Campaign live" event index (by type or label)
    const campaignLiveIndex = sortedEvents.findIndex(e => 
      e.type === "campaignLive" || e.label.toLowerCase().includes("campaign live")
    );
    
    // If this is "Campaign live" and it's in the past, it's the current stage
    if ((event.type === "campaignLive" || event.label.toLowerCase().includes("campaign live")) && isEventPast) {
      return "current";
    }
    
    // All events before "Campaign live" are completed
    if (campaignLiveIndex !== -1 && index < campaignLiveIndex) {
      return "completed";
    }
    
    // Events after "Campaign live" that are in the past are also completed
    if (campaignLiveIndex !== -1 && index > campaignLiveIndex && isEventPast) {
      return "completed";
    }
    
    // Future events (not started yet)
    if (!isEventPast) {
      return "upcoming";
    }
    
    // Default: completed if past
    return isEventPast ? "completed" : "upcoming";
  };

  const displayEvents = isEditing ? editedEvents : events;
  const sortedEvents = [...displayEvents].sort((a, b) => {
    const dateA = typeof a.date === "string" ? new Date(a.date) : a.date;
    const dateB = typeof b.date === "string" ? new Date(b.date) : b.date;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: feyTokens.colors.text.label }}
        >
          Event Timeline
        </h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.95)",
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>
      <FeySurface variant="card" overlay={true} padding="lg">
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-3 top-0 bottom-0 w-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          
          <div 
            className="space-y-3 overflow-y-auto"
            style={{
              maxHeight: "400px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            {sortedEvents.map((event, index) => {
              const eventDate = typeof event.date === "string" ? new Date(event.date) : event.date;
              const past = isPast(eventDate);
              const status = getEventStatus(event, index, sortedEvents);
              
              // Status-based glow styles
              const glowStyles = 
                status === "completed"
                  ? {
                      backgroundColor: "#22C55E",
                      boxShadow: `0 0 6px rgba(34, 197, 94, 0.6), 0 0 14px rgba(34, 197, 94, 0.35), 0 0 0 3px ${feyTokens.colors.base.dark}`,
                    }
                  : status === "current"
                  ? {
                      backgroundColor: "#E5E7EB",
                      boxShadow: `0 0 6px rgba(226, 232, 240, 0.7), 0 0 16px rgba(226, 232, 240, 0.4), 0 0 0 3px ${feyTokens.colors.base.dark}`,
                    }
                  : {
                      // upcoming/neutral - no glow
                      backgroundColor: "#2A2A2A",
                      boxShadow: `0 0 0 3px ${feyTokens.colors.base.dark}`,
                    };
              
              return (
                <div key={event.id} className="relative flex items-start gap-3">
                  {/* Dot */}
                  <div
                    className="relative z-10 mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
                    style={glowStyles}
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={event.label}
                          onChange={(e) => updateEvent(event.id, "label", e.target.value)}
                          className="w-full rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 outline-none border border-white/10 focus:border-white/20"
                          placeholder="Event label"
                        />
                        <input
                          type="date"
                          value={eventDate.toISOString().split("T")[0]}
                          onChange={(e) => updateEvent(event.id, "date", new Date(e.target.value))}
                          className="w-full rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none border border-white/10 focus:border-white/20"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-1.5 rounded transition-colors"
                            style={{
                              color: "rgba(255,255,255,0.50)",
                            }}
                            title="Delete event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-xs font-medium"
                          style={{
                            color: past ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.92)",
                          }}
                        >
                          {event.label}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{
                            color: past ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.60)",
                          }}
                        >
                          {eventDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isEditing && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add event
              </button>
            )}
          </div>
        </div>
      </FeySurface>
    </div>
  );
}
