"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders } from "lucide-react";
import type { DashboardMode } from "@/features/campaign-intelligence/CampaignIntelligenceDashboard";

interface MetricsPanelProps {
  mode: DashboardMode;
  selectedMetrics: string[];
  onChange: (metrics: string[]) => void;
}

const metricGroups = {
  track: {
    Performance: [
      { id: "views", label: "Views" },
      { id: "reach", label: "Reach" },
      { id: "engagements", label: "Engagements" },
      { id: "ctr", label: "CTR" },
    ],
  },
  manage: {
    Budget: [
      { id: "budgetSpent", label: "Budget Spent" },
      { id: "budgetAllocated", label: "Budget Allocated" },
      { id: "remainingBudget", label: "Remaining Budget" },
    ],
  },
  pay: {
    Payments: [
      { id: "amountPaid", label: "Amount Paid" },
      { id: "amountCommitted", label: "Amount Committed" },
      { id: "outstandingBalance", label: "Outstanding Balance" },
    ],
  },
};

const metricColors: Record<string, string> = {
  views: "#E5484D",
  reach: "#E3A23A",
  engagements: "#8B5CF6",
  ctr: "#10B981",
  budgetSpent: "#E5484D",
  budgetAllocated: "#E3A23A",
  remainingBudget: "#8B5CF6",
  amountPaid: "#E5484D",
  amountCommitted: "#E3A23A",
  outstandingBalance: "#8B5CF6",
};

export function MetricsPanel({ mode, selectedMetrics, onChange }: MetricsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groups = metricGroups[mode];
  const allMetrics = Object.values(groups).flat();

  const toggleMetric = (metricId: string) => {
    if (selectedMetrics.includes(metricId)) {
      onChange(selectedMetrics.filter((m) => m !== metricId));
    } else {
      onChange([...selectedMetrics, metricId]);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-24 z-40 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0A0A0E]/90 backdrop-blur-xl px-3 py-2 text-xs text-white/90 hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Sliders className="h-3.5 w-3.5" />
        <span>Metrics</span>
        {selectedMetrics.length > 0 && (
          <span className="rounded-full bg-[#E5484D] px-1.5 py-0.5 text-[10px] font-medium">
            {selectedMetrics.length}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-6 top-32 z-40 w-72 rounded-lg border border-white/10 bg-[#0A0A0E]/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="border-b border-white/5 px-4 py-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Compare Metrics
                </h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-3">
                {Object.entries(groups).map(([groupName, metrics]) => (
                  <div key={groupName} className="mb-4 last:mb-0">
                    <div className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
                      {groupName}
                    </div>
                    <div className="space-y-0.5">
                      {metrics.map((metric) => {
                        const isSelected = selectedMetrics.includes(metric.id);
                        return (
                          <button
                            key={metric.id}
                            onClick={() => toggleMetric(metric.id)}
                            className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: isSelected
                                    ? metricColors[metric.id] || "#E5484D"
                                    : "rgba(255,255,255,0.2)",
                                }}
                              />
                              <span>{metric.label}</span>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: metricColors[metric.id] || "#E5484D" }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 px-4 py-3">
                <div className="text-[10px] text-white/40">
                  {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? "s" : ""} selected
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}








