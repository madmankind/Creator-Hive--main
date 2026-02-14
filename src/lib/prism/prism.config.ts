import type { PrismArchetypeId } from "./prism.types";
import type { PrismArchetypeName } from "@/lib/curatedTalent";
import { Bolt, Share2, Compass, GitMerge, Box, FlaskConical, PenTool, Waves } from "lucide-react";

export type PrismArchetypeConfig = {
  name: PrismArchetypeName;
  roleLabel: string;
  tooltipSubtitle: string;
  colorSolid: string;
  icon: typeof Bolt; // Lucide icon component
};

export const PRISM_ARCHETYPES: Record<PrismArchetypeId, PrismArchetypeConfig> = {
  maverick: {
    name: "The Maverick",
    roleLabel: "The Visionary Disruptor",
    tooltipSubtitle: "Vision-led disruptor. Thrives in ambiguity.",
    colorSolid: "#a855f7", // Purple
    icon: Bolt,
  },
  conductor: {
    name: "The Conductor",
    roleLabel: "The Harmonizer",
    tooltipSubtitle: "Aligns teams fast. Calm under pressure.",
    colorSolid: "#f59e0b", // Amber
    icon: Share2,
  },
  pathfinder: {
    name: "The Pathfinder",
    roleLabel: "The Navigator",
    tooltipSubtitle: "Strategy + KPIs. Maps the route.",
    colorSolid: "#3b82f6", // Blue
    icon: Compass,
  },
  translator: {
    name: "The Translator",
    roleLabel: "The Bridge",
    tooltipSubtitle: "Bridges technical and human worlds.",
    colorSolid: "#6366f1", // Indigo
    icon: GitMerge,
  },
  architect: {
    name: "The Architect",
    roleLabel: "The Builder",
    tooltipSubtitle: "Systems-first builder. Stability obsessed.",
    colorSolid: "#22c55e", // Green
    icon: Box,
  },
  alchemist: {
    name: "The Alchemist",
    roleLabel: "The Scientist",
    tooltipSubtitle: "Tests and optimizes. Data-driven growth.",
    colorSolid: "#06b6d4", // Cyan
    icon: FlaskConical,
  },
  auteur: {
    name: "The Auteur",
    roleLabel: "The Artist",
    tooltipSubtitle: "Craft perfectionist. Deep-focus maker.",
    colorSolid: "#d946ef", // Magenta
    icon: PenTool,
  },
  amplifier: {
    name: "The Amplifier",
    roleLabel: "The Voice",
    tooltipSubtitle: "High-energy communicator. Scales attention.",
    colorSolid: "#f97316", // Orange
    icon: Waves,
  },
};

// Map full archetype name to ID for lookup
const ARCHETYPE_NAME_TO_ID: Record<PrismArchetypeName, PrismArchetypeId> = {
  "The Maverick": "maverick",
  "The Conductor": "conductor",
  "The Pathfinder": "pathfinder",
  "The Translator": "translator",
  "The Architect": "architect",
  "The Alchemist": "alchemist",
  "The Auteur": "auteur",
  "The Amplifier": "amplifier",
};

export function getPrismConfigByName(name: PrismArchetypeName): PrismArchetypeConfig {
  const id = ARCHETYPE_NAME_TO_ID[name];
  return PRISM_ARCHETYPES[id];
}
