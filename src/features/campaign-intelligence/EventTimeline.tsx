"use client";

import { campaignTheme } from "@/lib/campaign-theme";

interface EventTimelineProps {
  campaignIds: string[];
}

interface TimelineEvent {
  id: string;
  type: "started" | "talentAdded" | "invoiceSent" | "paymentCompleted";
  date: Date;
  label: string;
}

export function EventTimeline({ campaignIds }: EventTimelineProps) {
  // Mock events - will be replaced with API calls
  const events: TimelineEvent[] = [
    {
      id: "1",
      type: "started",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      label: "Campaign started",
    },
    {
      id: "2",
      type: "talentAdded",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      label: "Talent added",
    },
    {
      id: "3",
      type: "invoiceSent",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      label: "Invoice sent",
    },
    {
      id: "4",
      type: "paymentCompleted",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      label: "Payment completed",
    },
  ];

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "started":
        return campaignTheme.colors.primary;
      case "talentAdded":
        return campaignTheme.colors.secondary;
      case "invoiceSent":
        return campaignTheme.graph.line.tertiary;
      case "paymentCompleted":
        return campaignTheme.colors.primary;
      default:
        return campaignTheme.colors.text.muted;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[#EDEDED]">Event Timeline</h3>
      <div className="rounded-xl border border-white/10 bg-[#0B0B0E]/50 backdrop-blur-sm p-4">
        <div className="space-y-3">
          {events.map((event, index) => (
            <button
              key={event.id}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
            >
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getEventColor(event.type) }}
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs text-[#EDEDED]">{event.label}</div>
                <div className="text-[10px] text-[#9B9B9B]">
                  {event.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}








