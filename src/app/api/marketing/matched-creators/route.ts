import { NextResponse } from "next/server";
import { z } from "zod";
import type { CuratedTalent, PrismArchetypeName, TalentCategoryTag } from "@/lib/curatedTalent";
import { db } from "@/server/db";

const bodySchema = z.object({
  ids: z.array(z.string()).max(24),
});

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

function asRoleTag(s: string | undefined): TalentCategoryTag {
  const t = (s?.trim() || "Content Creator") as TalentCategoryTag;
  return t;
}

/** Map DB profile → CuratedTalent-shaped card for landing carousel (minimal fields). */
function toCuratedCard(
  r: {
    id: string;
    name: string;
    primaryRole: string | null;
    skills: string[];
    niches: string[];
    rankedIndustries: string[];
    bio: string | null;
    location: string | null;
    prismArchetype: string | null;
    avatarUrl: string | null;
    instagram: string | null;
  },
): CuratedTalent {
  const extId = `db:${r.id}`;
  const primary = asRoleTag(r.primaryRole ?? undefined);
  const roleTags = [...new Set([primary, ...r.skills.map((x) => asRoleTag(x))])].slice(0, 8);
  const ig = r.instagram?.replace(/^@+/, "").trim() || "creator";
  const bio = (r.bio ?? "").trim() || "Creator on Creator Hive.";
  return {
    id: extId,
    name: r.name,
    displayName: r.name.split(/\s+/)[0] || r.name,
    displayTitle: primary,
    instagramHandle: ig,
    instagramUrl: `https://instagram.com/${ig}`,
    avatarUrl: r.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0d0d1a&color=a78bfa&size=512`,
    profileImageUrl: r.avatarUrl ?? undefined,
    primaryRole: primary,
    roleTags,
    platformTags: ["Instagram"],
    shortBio: bio.slice(0, 280),
    nicheSummary: bio.slice(0, 280),
    availability: ["Hourly"],
    prismArchetype: safePrism(r.prismArchetype),
    location: r.location ?? "UAE",
    brandPartners: [...r.niches, ...r.rankedIndustries].slice(0, 4),
  };
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rawIds = parsed.data.ids.map((x) => x.trim()).filter(Boolean);
  const cuidList = rawIds
    .map((id) => (id.startsWith("db:") ? id.slice(3) : id))
    .filter((id) => /^c[a-z0-9]{20,40}$/i.test(id));

  if (cuidList.length === 0) {
    return NextResponse.json({ talents: [] as CuratedTalent[] });
  }

  const rows = await db.creatorProfile.findMany({
    where: {
      id: { in: cuidList },
      isActive: true,
      onboardingCompletedAt: { not: null },
    },
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
      avatarUrl: true,
      instagram: true,
    },
  });

  const talents = rows.map(toCuratedCard);
  return NextResponse.json({ talents });
}
