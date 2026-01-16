"use client";

import { useState } from "react";
import { X, FileText, Edit, History } from "lucide-react";
import { RightDrawer } from "@/components/campaigns/primitives/RightDrawer";
import { PillSegment } from "@/components/campaigns/primitives/PillSegment";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { feyTokens } from "@/lib/fey-design-tokens";

interface ContractDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  campaignName?: string;
  contractId?: string;
}

export function ContractDrawer({ isOpen, onClose, campaignId, campaignName, contractId }: ContractDrawerProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "edit" | "audit">("preview");

  const tabs = [
    { value: "preview", label: "Preview" },
    { value: "edit", label: "Edit fields" },
    { value: "audit", label: "Audit / Versions" },
  ];

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Contract"
      width="520px"
    >
      <div className="p-6 space-y-5">
        {/* Contract Summary Header */}
        <FeySurface variant="card" padding="md">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: feyTokens.colors.text.label }}>
              Contract Summary
            </div>
            <div className="text-sm font-semibold" style={{ color: feyTokens.colors.text.primary }}>
              {campaignName || "Campaign Contract"}
            </div>
            {contractId && (
              <div className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                Contract ID: {contractId}
              </div>
            )}
            <div className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
              Parties: Client ↔ Creator Hive
            </div>
            <div className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
              Status: <span style={{ color: feyTokens.colors.text.secondary }}>Pending signature</span>
            </div>
          </div>
        </FeySurface>

        {/* Tabs */}
        <PillSegment
          options={tabs}
          value={activeTab}
          onChange={(v) => setActiveTab(v as "preview" | "edit" | "audit")}
          size="sm"
        />

        {/* Tab Content */}
        {activeTab === "preview" && (
          <FeySurface variant="card" padding="md">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: feyTokens.colors.text.label }}>
                Contract Preview
              </div>
              <div className="text-sm leading-relaxed" style={{ color: feyTokens.colors.text.secondary }}>
                This contract will be generated using onboarding data already captured.
                <br /><br />
                Scope, payment terms, and deliverables will be pulled from the campaign pod configuration.
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10"
                  style={{
                    borderColor: feyTokens.borders.default,
                    color: feyTokens.colors.text.primary,
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Generate / Regenerate
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10"
                  style={{
                    borderColor: feyTokens.borders.default,
                    color: feyTokens.colors.text.primary,
                  }}
                  disabled
                  title="Available after campaign pod is confirmed"
                >
                  Send for signature
                </button>
              </div>
            </div>
          </FeySurface>
        )}

        {activeTab === "edit" && (
          <FeySurface variant="card" padding="md">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: feyTokens.colors.text.label }}>
                Edit Contract Fields
              </div>
              <div className="text-sm" style={{ color: feyTokens.colors.text.secondary }}>
                Contract fields can be edited here before generation.
                <br /><br />
                Changes will be reflected in the generated contract.
              </div>
              {/* Placeholder for editable fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: feyTokens.colors.text.label }}>
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    defaultValue="50% deposit, 25% on submission, 25% on approval"
                    className="w-full rounded-lg border px-3 py-2 text-xs bg-transparent"
                    style={{
                      borderColor: feyTokens.borders.default,
                      color: feyTokens.colors.text.primary,
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: feyTokens.colors.text.label }}>
                    Timeline
                  </label>
                  <input
                    type="text"
                    defaultValue="2 weeks from contract signing"
                    className="w-full rounded-lg border px-3 py-2 text-xs bg-transparent"
                    style={{
                      borderColor: feyTokens.borders.default,
                      color: feyTokens.colors.text.primary,
                    }}
                  />
                </div>
              </div>
            </div>
          </FeySurface>
        )}

        {activeTab === "audit" && (
          <FeySurface variant="card" padding="md">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: feyTokens.colors.text.label }}>
                Contract Versions
              </div>
              <div className="text-sm" style={{ color: feyTokens.colors.text.secondary }}>
                Version history and audit trail will appear here.
                <br /><br />
                Each contract generation creates a new version.
              </div>
              <div className="pt-2 text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                No versions yet. Generate a contract to create the first version.
              </div>
            </div>
          </FeySurface>
        )}
      </div>
    </RightDrawer>
  );
}




