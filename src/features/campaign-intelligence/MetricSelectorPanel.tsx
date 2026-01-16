"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2 } from "lucide-react";
import { campaignTheme } from "@/lib/campaign-theme";
import type { DashboardMode } from "./CampaignIntelligenceDashboard";

interface MetricSelectorPanelProps {
  mode: DashboardMode;
  selectedMetrics: string[];
  onChange: (metrics: string[]) => void;
}

const metricGroups = {
  track: {
    Performance: ["views", "reach", "engagements", "ctr"],
  },
  manage: {
    Budget: ["budgetSpent", "budgetAllocated", "remainingBudget"],
  },
  pay: {
    Payments: ["amountPaid", "amountCommitted", "outstandingBalance"],
  },
};

export function MetricSelectorPanel({
  mode,
  selectedMetrics,
  onChange,
}: MetricSelectorPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groups = metricGroups[mode];
  const allMetrics = Object.values(groups).flat();

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onChange(selectedMetrics.filter((m) => m !== metric));
    } else {
      onChange([...selectedMetrics, metric]);
    }
  };

  const getMetricLabel = (metric: string) => {
    return metric
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-24 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-[#0B0B0E]/80 backdrop-blur-xl px-4 py-2 text-sm text-[#EDEDED] hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings2 className="h-4 w-4" />
        <span>Metrics</span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-6 top-32 z-40 w-64 rounded-xl border border-white/20 bg-[#0B0B0E]/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="p-4">
              <div className="mb-4 text-xs font-medium uppercase tracking-wider text-[#9B9B9B]">
                Compare Metrics
              </div>
              {Object.entries(groups).map(([groupName, metrics]) => (
                <div key={groupName} className="mb-4">
                  <div className="mb-2 text-xs font-medium text-[#EDEDED]">{groupName}</div>
                  <div className="space-y-1">
                    {metrics.map((metric) => {
                      const isSelected = selectedMetrics.includes(metric);
                      return (
                        <button
                          key={metric}
                          onClick={() => toggleMetric(metric)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-[#EDEDED] hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: isSelected
                                  ? campaignTheme.colors.primary
                                  : campaignTheme.colors.text.muted,
                              }}
                            />
                            <span>{getMetricLabel(metric)}</span>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: campaignTheme.colors.primary }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}








