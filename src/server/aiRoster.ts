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

let onboardedCache: { at: number; lines: string; ids: string[]; compact: boolean } | null = null;
const ONBOARDED_TTL_MS = 45_000;

export function buildCuratedRosterBlock(opts?: { compact?: boolean }): { text: string; ids: string[] } {
  const compact = opts?.compact ?? false;
  const ids = curatedTalent.map((t) => t.id);
  const text = curatedTalent
    .map((t) => {
      const roles = [t.primaryRole, ...(t.roleTags ?? []).filter((r) => r !== t.primaryRole)].join(", ");
      const bio = t.shortBio ?? t.nicheSummary ?? "";
      const brands = t.brandPartners?.slice(0, 3).join(", ") ?? "";
      if (compact) {
        const rShort = roles.split(", ").slice(0, 4).join(", ");
        return `- ID:${t.id} | ${t.displayName ?? t.name} | ${rShort} | ${t.displayTitle ?? ""} | ${bio.slice(0, 52)} | ${t.location ?? "UAE"}`;
      }
      return `- ID:${t.id} | Name:${t.displayName ?? t.name} | Roles:${roles} | Niche:${t.displayTitle ?? ""} | Bio:${bio.slice(0, 120)} | Brands:${brands} | Location:${t.location ?? "UAE"} | Archetype:${t.prismArchetype}`;
    })
    .join("\n");
  return { text, ids };
}

export async function buildOnboardedRosterBlock(opts?: { compact?: boolean }): Promise<{ text: string; ids: string[] }> {
  const compact = opts?.compact ?? false;
  const now = Date.now();
  if (onboardedCache && onboardedCache.compact === compact && now - onboardedCache.at < ONBOARDED_TTL_MS) {
    return { text: onboardedCache.lines, ids: [...onboardedCache.ids] };
  }

  const rows = await db.creatorProfile.findMany({
    where: {
      isActive: true,
      onboardingCompletedAt: { not: null },
      userId: { not: null },
    },
    take: compact ? 28 : 60,
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
      const bio = (r.bio ?? "").replace(/\s+/g, " ").trim().slice(0, compact ? 72 : 140);
      if (compact) {
        return `- ID:${id} | ${r.name} | ${roles || "Creator"} | ${(niches || "—").slice(0, 64)} | ${r.location ?? "UAE"} | ${bio}`;
      }
      return `- ID:${id} | Name:${r.name} | Roles:${roles || "Creator"} | Niches:${niches || "—"} | PRISM:${safePrism(r.prismArchetype)} | Fit:${fit || "—"} | Loc:${r.location ?? "UAE"} | Bio:${bio}`;
    })
    .join("\n");

  onboardedCache = { at: now, lines, ids, compact };
  return { text: lines, ids };
}

export async function getCombinedAiRoster(opts?: { compact?: boolean }): Promise<{
  rosterSystemSection: string;
  validTalentIds: Set<string>;
}> {
  const compact = opts?.compact ?? false;
  const curated = buildCuratedRosterBlock({ compact });
  const onboarded = await buildOnboardedRosterBlock({ compact });

  const rosterSystemSection = `CURATED_SHOWCASE_ROSTER (pre-vetted profiles):
${curated.text}

PLATFORM_ONBOARDED_CREATORS (completed Creator Hive onboarding — use db: IDs exactly):
${onboarded.text || "(none yet)"}`;

  const validTalentIds = new Set<string>([...curated.ids, ...onboarded.ids]);
  return { rosterSystemSection, validTalentIds };
}
