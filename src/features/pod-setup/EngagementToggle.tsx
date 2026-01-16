"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import type { EngagementType } from "@/types/pod";

interface EngagementToggleProps {
  value: EngagementType;
  onChange: (value: EngagementType) => void;
}

export function EngagementToggle({ value, onChange }: EngagementToggleProps) {
  return (
    <SegmentedControl
      options={[
        { value: "per-project", label: "Project" },
        { value: "short-term", label: "Short" },
        { value: "long-term", label: "Long" },
      ]}
      value={value}
      onChange={(v) => onChange(v as EngagementType)}
    />
  );
}












<<<<<<< Current (Your changes)

=======
>>>>>>> Incoming (Background Agent changes)
