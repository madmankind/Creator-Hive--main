"use client";

import { motion, AnimatePresence } from "framer-motion";
import { feyTokens } from "@/lib/fey-design-tokens";

interface MetricsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

const metricGroups = {
  Performance: [
    { id: "reach", label: "Reach" },
    { id: "impressions", label: "Impressions" },
    { id: "engagements", label: "Engagements" },
    { id: "er", label: "Engagement Rate (ER%)" },
    { id: "views", label: "Video Views" },
  ],
  "Delivery / Efficiency": [
    { id: "cpm", label: "CPM" },
    { id: "cpe", label: "CPE" },
  ],
  "Budget / Financial": [
    { id: "budgetSpent", label: "Budget Spent" },
    { id: "remainingBudget", label: "Remaining Budget" },
    { id: "costPerDeliverable", label: "Cost per Deliverable" },
  ],
  "Revenue / Earnings": [
    { id: "creatorEarnings", label: "Creator Earnings (Paid)" },
    { id: "outstanding", label: "Outstanding (Unpaid)" },
    { id: "agencyFees", label: "Agency Fees" },
  ],
};

const metricColors: Record<string, string> = {
  reach: feyTokens.colors.chart.primary,
  impressions: feyTokens.colors.chart.secondary,
  engagements: feyTokens.colors.chart.tertiary,
  er: feyTokens.colors.chart.quaternary,
  views: feyTokens.colors.chart.primary,
  cpm: feyTokens.colors.chart.secondary,
  cpe: feyTokens.colors.chart.tertiary,
  budgetSpent: feyTokens.colors.chart.primary,
  remainingBudget: feyTokens.colors.chart.secondary,
  costPerDeliverable: feyTokens.colors.chart.tertiary,
  creatorEarnings: feyTokens.colors.chart.quaternary,
  outstanding: feyTokens.colors.chart.primary,
  agencyFees: feyTokens.colors.chart.secondary,
};

export function MetricsPopover({
  isOpen,
  onClose,
  selectedMetrics,
  onMetricsChange,
}: MetricsPopoverProps) {
  const toggleMetric = (metricId: string) => {
    if (selectedMetrics.includes(metricId)) {
      onMetricsChange(selectedMetrics.filter((m) => m !== metricId));
    } else {
      onMetricsChange([...selectedMetrics, metricId]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          />
          {/* Popover */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-6 top-32 z-40 w-80 rounded-lg border shadow-2xl"
            style={{
              borderColor: feyTokens.borders.default,
              background: `${feyTokens.colors.base.darker}EE`,
              backdropFilter: "blur(20px)",
              boxShadow: feyTokens.shadows.modal,
            }}
          >
            <div
              className="border-b px-4 py-3"
              style={{ borderColor: feyTokens.borders.default }}
            >
              <h3
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: feyTokens.colors.text.label }}
              >
                Compare Metrics
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {Object.entries(metricGroups).map(([groupName, metrics]) => (
                <div key={groupName} className="mb-4 last:mb-0">
                  <div
                    className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: feyTokens.colors.text.label }}
                  >
                    {groupName}
                  </div>
                  <div className="space-y-0.5">
                    {metrics.map((metric) => {
                      const isSelected = selectedMetrics.includes(metric.id);
                      return (
                        <button
                          key={metric.id}
                          onClick={() => toggleMetric(metric.id)}
                          className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-white/5"
                          style={{ color: feyTokens.colors.text.secondary }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: isSelected
                                  ? metricColors[metric.id] || feyTokens.colors.chart.primary
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
                              style={{
                                backgroundColor: metricColors[metric.id] || feyTokens.colors.chart.primary,
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="border-t px-4 py-3"
              style={{ borderColor: feyTokens.borders.default }}
            >
              <div
                className="text-[10px]"
                style={{ color: feyTokens.colors.text.muted }}
              >
                {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? "s" : ""} selected
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

