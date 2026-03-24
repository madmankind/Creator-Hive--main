"use client";

import type { PrismArchetypeName } from "@/lib/curatedTalent";
import { PRISM_ARCHETYPE_DESCRIPTIONS } from "@/lib/curatedTalent";
import { Tooltip } from "@/components/ui/tooltip";
import { Zap, Radio, Layers, Film, Languages, Music2, FlaskConical, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

type PrismBadgeProps = {
  archetypeName: PrismArchetypeName;
  size?: number;
};

const ARCHETYPE_CONFIG: Record<PrismArchetypeName, {
  icon: React.ElementType;
  text: string;
  ring: string;
  bg: string;
}> = {
  "The Maverick":   { icon: Zap,          text: "text-amber-400",  ring: "ring-amber-400/30",   bg: "bg-amber-400/10" },
  "The Amplifier":  { icon: Radio,         text: "text-emerald-400",ring: "ring-emerald-400/30", bg: "bg-emerald-400/10" },
  "The Architect":  { icon: Layers,        text: "text-blue-400",   ring: "ring-blue-400/30",    bg: "bg-blue-400/10" },
  "The Auteur":     { icon: Film,          text: "text-violet-400", ring: "ring-violet-400/30",  bg: "bg-violet-400/10" },
  "The Translator": { icon: Languages,     text: "text-cyan-400",   ring: "ring-cyan-400/30",    bg: "bg-cyan-400/10" },
  "The Conductor":  { icon: Music2,        text: "text-pink-400",   ring: "ring-pink-400/30",    bg: "bg-pink-400/10" },
  "The Alchemist":  { icon: FlaskConical,  text: "text-orange-400", ring: "ring-orange-400/30",  bg: "bg-orange-400/10" },
  "The Pathfinder": { icon: Compass,       text: "text-teal-400",   ring: "ring-teal-400/30",    bg: "bg-teal-400/10" },
};

export function PrismBadge({ archetypeName, size = 32 }: PrismBadgeProps) {
  const config = ARCHETYPE_CONFIG[archetypeName];
  const description = PRISM_ARCHETYPE_DESCRIPTIONS[archetypeName];
  const tooltipContent = description
    ? `${archetypeName} — ${description}`
    : archetypeName;

  if (!config) {
    // Fallback for unknown archetypes
    return (
      <Tooltip content={tooltipContent}>
        <div
          className="inline-flex items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 text-[10px] font-medium text-white/90 px-1.5 cursor-help"
          style={{ minWidth: size, height: size }}
        >
          {archetypeName.replace(/^The\s+/, "")}
        </div>
      </Tooltip>
    );
  }

  const Icon = config.icon;

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full ring-1 cursor-help",
          "opacity-70 hover:opacity-100 transition-opacity duration-200",
          config.bg,
          config.ring
        )}
        style={{ width: size, height: size }}
      >
        <Icon className={cn("w-[14px] h-[14px]", config.text)} />
      </div>
    </Tooltip>
  );
}
