import { curatedTalent } from "@/lib/curatedTalent";
import type { PrismArchetypeName } from "@/lib/curatedTalent";
import { db } from "@/server/db";

const PRISM_SET = new Set<string>([
  "The Maverick",
  "The Conductor",
  "The Pathfinder",
  "The Translator",
  "The Architect",
  "The Alchemist",
  "The Auteur",
  "The Amplifier",
]);

function safePrism(raw: string | null | undefined): PrismArchetypeName {
  const s = raw?.trim() ?? "";
  return (PRISM_SET.has(s) ? s : "The Translator") as PrismArchetypeName;
}

let onboardedCache: { at: number; lines: string; ids: string[] } | null = null;
const ONBOARDED_TTL_MS = 45_000;

export function buildCuratedRosterBlock(): { text: string; ids: string[] } {
  const ids = curatedTalent.map((t) => t.id);
  const text = curatedTalent
    .map((t) => {
      const roles = [t.primaryRole, ...(t.roleTags ?? []).filter((r) => r !== t.primaryRole)].join(", ");
      const bio = t.shortBio ?? t.nicheSummary ?? "";
      const brands = t.brandPartners?.slice(0, 3).join(", ") ?? "";
      return `- ID:${t.id} | Name:${t.displayName ?? t.name} | Roles:${roles} | Niche:${t.displayTitle ?? ""} | Bio:${bio.slice(0, 120)} | Brands:${brands} | Location:${t.location ?? "UAE"} | Archetype:${t.prismArchetype}`;
    })
    .join("\n");
  return { text, ids };
}

export async function buildOnboardedRosterBlock(): Promise<{ text: string; ids: string[] }> {
  const now = Date.now();
  if (onboardedCache && now - onboardedCache.at < ONBOARDED_TTL_MS) {
    return { text: onboardedCache.lines, ids: [...onboardedCache.ids] };
  }

  const rows = await db.creatorProfile.findMany({
    where: {
      isActive: true,
      onboardingCompletedAt: { not: null },
      userId: { not: null },
    },
    take: 60,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      primaryRole: true,
      skills: true,
      niches: true,
      rankedIndustries: true,
      bio: true,
      location: true,
      prismArchetype: true,
      preferredPace: true,
      howIWorkBest: true,
      feedbackStyle: true,
      availabilityType: true,
      workModeOpenness: true,
      yearsExperienceBand: true,
    },
  });

  const ids: string[] = [];
  const lines = rows
    .map((r) => {
      const id = `db:${r.id}`;
      ids.push(id);
      const roleBits = [r.primaryRole, ...r.skills].filter(Boolean);
      const roles = [...new Set(roleBits)].slice(0, 6).join(", ");
      const nicheBits = [...r.niches, ...r.rankedIndustries];
      const niches = [...new Set(nicheBits)].slice(0, 8).join(", ");
      const fit = [r.yearsExperienceBand, r.preferredPace, r.howIWorkBest, r.feedbackStyle, r.availabilityType, r.workModeOpenness]
        .filter(Boolean)
        .join(" · ");
      const bio = (r.bio ?? "").replace(/\s+/g, " ").trim().slice(0, 140);
      return `- ID:${id} | Name:${r.name} | Roles:${roles || "Creator"} | Niches:${niches || "—"} | PRISM:${safePrism(r.prismArchetype)} | Fit:${fit || "—"} | Loc:${r.location ?? "UAE"} | Bio:${bio}`;
    })
    .join("\n");

  onboardedCache = { at: now, lines, ids };
  return { text: lines, ids };
}

export async function getCombinedAiRoster(): Promise<{
  rosterSystemSection: string;
  validTalentIds: Set<string>;
}> {
  const curated = buildCuratedRosterBlock();
  const onboarded = await buildOnboardedRosterBlock();

  const rosterSystemSection = `CURATED_SHOWCASE_ROSTER (pre-vetted profiles):
${curated.text}

PLATFORM_ONBOARDED_CREATORS (completed Creator Hive onboarding — use db: IDs exactly):
${onboarded.text || "(none yet)"}`;

  const validTalentIds = new Set<string>([...curated.ids, ...onboarded.ids]);
  return { rosterSystemSection, validTalentIds };
}
