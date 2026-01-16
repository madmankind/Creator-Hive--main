"use client";

import { useState } from "react";
import { feyTokens } from "@/lib/fey-design-tokens";
import { FeySurface } from "@/components/campaigns/primitives/FeySurface";
import { CheckCircle2, Upload, X } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  status: "complete" | "pending" | "missing";
  required?: boolean;
}

interface CampaignSetupChecklistProps {
  campaignId?: string;
  onTradeLicenseUpload?: (file: File) => void;
}

export function CampaignSetupChecklist({ campaignId, onTradeLicenseUpload }: CampaignSetupChecklistProps) {
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [tradeLicenseFileName, setTradeLicenseFileName] = useState<string>("");

  // Mock checklist state - in production, fetch from campaign data
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "brief", label: "Brief completed", status: "complete", required: true },
    { id: "tradeLicense", label: "Trade license uploaded", status: tradeLicenseFile ? "complete" : "missing", required: true },
    { id: "bookingRequest", label: "Booking request sent", status: "pending", required: true },
    { id: "talentConfirmed", label: "Talent confirmed", status: "pending", required: false },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setTradeLicenseFile(file);
      setTradeLicenseFileName(file.name);
      onTradeLicenseUpload?.(file);
      
      // Update checklist
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === "tradeLicense" ? { ...item, status: "complete" as const } : item
        )
      );
    }
  };

  const handleRemoveFile = () => {
    setTradeLicenseFile(null);
    setTradeLicenseFileName("");
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === "tradeLicense" ? { ...item, status: "missing" as const } : item
      )
    );
  };

  return (
    <FeySurface variant="card" padding="md">
      <div
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: feyTokens.colors.text.label }}
      >
        Campaign Setup
      </div>
      <div className="space-y-3">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.status === "complete" ? (
                <CheckCircle2 className="h-4 w-4" style={{ color: "#22C55E" }} />
              ) : (
                <div
                  className="h-4 w-4 rounded-full border"
                  style={{
                    borderColor: item.status === "missing" && item.required ? "#F59E0B" : feyTokens.borders.default,
                  }}
                />
              )}
              <span
                className="text-xs"
                style={{
                  color:
                    item.status === "complete"
                      ? feyTokens.colors.text.secondary
                      : item.status === "missing" && item.required
                        ? "#F59E0B"
                        : feyTokens.colors.text.muted,
                }}
              >
                {item.label}
                {item.required && <span className="ml-1">*</span>}
              </span>
            </div>
            {item.id === "tradeLicense" && item.status === "missing" && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex items-center gap-1 text-[11px] transition-colors hover:opacity-80" style={{ color: feyTokens.colors.text.secondary }}>
                  <Upload className="h-3 w-3" />
                  Upload
                </div>
              </label>
            )}
            {item.id === "tradeLicense" && item.status === "complete" && tradeLicenseFileName && (
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: feyTokens.colors.text.muted }}>
                  {tradeLicenseFileName}
                </span>
                <button
                  onClick={handleRemoveFile}
                  className="text-[11px] transition-colors hover:opacity-80"
                  style={{ color: feyTokens.colors.text.muted }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </FeySurface>
  );
}




