"use client";

import { cn } from "@/lib/utils";
import type { AddOn } from "@/types/pod";

interface AddOnsChecklistProps {
  value: AddOn[];
  onChange: (addOns: AddOn[]) => void;
}

const ADD_ONS: { value: AddOn; label: string; description: string }[] = [
  {
    value: "usage-rights",
    label: "Usage Rights",
    description: "Extended usage permissions",
  },
  {
    value: "whitelisting",
    label: "Whitelisting",
    description: "Platform whitelisting access",
  },
  {
    value: "exclusivity",
    label: "Exclusivity",
    description: "Exclusive content rights",
  },
];

export function AddOnsChecklist({ value, onChange }: AddOnsChecklistProps) {
  const toggleAddOn = (addOn: AddOn) => {
    if (value.includes(addOn)) {
      onChange(value.filter((a) => a !== addOn));
    } else {
      onChange([...value, addOn]);
    }
  };

  return (
    <div className="space-y-2">
      {ADD_ONS.map((addOn) => (
        <label
          key={addOn.value}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
            "border border-white/10",
            value.includes(addOn.value)
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-white/5 hover:bg-white/8"
          )}
        >
          <input
            type="checkbox"
            checked={value.includes(addOn.value)}
            onChange={() => toggleAddOn(addOn.value)}
            className="mt-0.5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
          />
          <span className="flex-1 inline-flex flex-col">
            <span className="text-xs font-medium text-white/90">
              {addOn.label}
            </span>
            <span className="text-[10px] text-white/50 mt-0.5">
              {addOn.description}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

