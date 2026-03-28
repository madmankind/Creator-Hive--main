import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db, handleDatabaseError } from "@/server/db";
import { requireUser } from "@/server/authz";

function toPrismaJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

function omitUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

/** Cached `creator_profiles` column names for this process (exact PG attname). */
let creatorProfileColumnCache: Set<string> | null = null;

async function getCreatorProfileColumnNames(): Promise<Set<string>> {
  if (creatorProfileColumnCache) return creatorProfileColumnCache;

  const scoped = await db.$queryRaw<Array<{ column_name: string }>>`
    SELECT a.attname::text AS column_name
    FROM pg_attribute a
    INNER JOIN pg_class c ON c.relkind = 'r' AND a.attrelid = c.oid
    INNER JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relname = 'creator_profiles'
      AND n.nspname = current_schema()::text
      AND a.attnum > 0
      AND NOT a.attisdropped
  `;

  if (scoped.length > 0) {
    creatorProfileColumnCache = new Set(scoped.map((r) => r.column_name));
    return creatorProfileColumnCache;
  }

  const anyNs = await db.$queryRaw<Array<{ column_name: string; nsp: string }>>`
    SELECT a.attname::text AS column_name, n.nspname::text AS nsp
    FROM pg_attribute a
    INNER JOIN pg_class c ON c.relkind = 'r' AND a.attrelid = c.oid
    INNER JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relname = 'creator_profiles'
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND a.attnum > 0
      AND NOT a.attisdropped
  `;
  const counts = new Map<string, number>();
  for (const r of anyNs) {
    counts.set(r.nsp, (counts.get(r.nsp) ?? 0) + 1);
  }
  let best = anyNs[0]?.nsp ?? "public";
  let bestC = 0;
  for (const [nsp, c] of counts) {
    if (c > bestC) {
      bestC = c;
      best = nsp;
    }
  }
  creatorProfileColumnCache = new Set(
    anyNs.filter((r) => r.nsp === best).map((r) => r.column_name),
  );
  return creatorProfileColumnCache;
}

/** Avoid Prisma SELECTing columns that are not on the physical table (schema drift). */
async function findCreatorProfileForOnboardingResponse(
  userId: string,
  cols: Set<string>,
): Promise<{
  id: string;
  name: string;
  instagram: string | null;
  location: string | null;
  skills: string[];
  niches: string[];
  avatarUrl: string | null;
  bio: string | null;
}> {
  const select: {
    id: true;
    name: true;
    instagram?: true;
    location?: true;
    skills?: true;
    niches?: true;
    avatarUrl?: true;
    bio?: true;
  } = { id: true, name: true };
  for (const k of ["instagram", "location", "skills", "niches", "avatarUrl", "bio"] as const) {
    if (cols.has(k)) select[k] = true;
  }
  const p = await db.creatorProfile.findUniqueOrThrow({
    where: { userId },
    select,
  });
  return {
    id: p.id,
    name: p.name,
    instagram: cols.has("instagram") ? (p as { instagram?: string | null }).instagram ?? null : null,
    location: cols.has("location") ? (p as { location?: string | null }).location ?? null : null,
    skills: cols.has("skills") ? (p as { skills?: string[] }).skills ?? [] : [],
    niches: cols.has("niches") ? (p as { niches?: string[] }).niches ?? [] : [],
    avatarUrl: cols.has("avatarUrl") ? (p as { avatarUrl?: string | null }).avatarUrl ?? null : null,
    bio: cols.has("bio") ? (p as { bio?: string | null }).bio ?? null : null,
  };
}

/** Columns we may set from onboarding APIs — must match DB / prisma schema (camelCase quoted). */
const CREATOR_PROFILE_RAW_UPDATABLE = new Set([
  "name",
  "instagram",
  "bio",
  "location",
  "skills",
  "niches",
  "avatarUrl",
  "hourlyRate",
  "prismArchetype",
  "portfolioUrl",
  "primaryRole",
  "rankedIndustries",
  "yearsExperienceBand",
  "preferredProjectTypes",
  "preferredPace",
  "feedbackStyle",
  "howIWorkBest",
  "suitedTeamScale",
  "workEnvironmentFit",
  "availabilityType",
  "workModeOpenness",
  "brandFitPreferences",
  "clientValueStrengths",
  "teamSetupPreference",
  "prismArchetypeSecondary",
  "generatedMatchTags",
  "onboardingTranscriptJson",
  "onboardingAiSummary",
  "onboardingCompletedAt",
  "isActive",
]);

/**
 * Turbopack `next dev` can bundle Prisma such that `update`/`create` reject valid fields
 * (e.g. `primaryRole`). Raw SQL uses the real Postgres columns and avoids that layer.
 */
async function saveCreatorProfileForUser(
  userId: string,
  payload: Record<string, unknown>,
): Promise<{
  id: string;
  name: string;
  instagram: string | null;
  location: string | null;
  skills: string[];
  niches: string[];
  avatarUrl: string | null;
  bio: string | null;
}> {
  const newId = `c${randomBytes(16).toString("hex")}`;
  const name = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : "Creator";
  const instagram = typeof payload.instagram === "string" ? payload.instagram : null;
  const skills = Array.isArray(payload.skills) ? (payload.skills as string[]) : [];
  const niches = Array.isArray(payload.niches) ? (payload.niches as string[]) : [];

  const pgCols = await getCreatorProfileColumnNames();

  await db.$executeRaw(Prisma.sql`
    INSERT INTO "creator_profiles" (
      "id",
      "userId",
      "name",
      "instagram",
      "skills",
      "niches",
      "createdAt",
      "updatedAt",
      "talentStatus",
      "isActive",
      "stripeOnboardingStatus",
      "availabilityStatus",
      "profileViews",
      "totalEarned",
      "isVerified",
      "instagramVerified",
      "tiktokVerified"
    ) VALUES (
      ${newId},
      ${userId},
      ${name},
      ${instagram},
      CAST(${skills} AS TEXT[]),
      CAST(${niches} AS TEXT[]),
      NOW(),
      NOW(),
      'pending',
      true,
      ${Prisma.raw(`'NOT_STARTED'::"StripeOnboardingStatus"`)},
      'AVAILABLE',
      0,
      0,
      false,
      false,
      false
    )
    ON CONFLICT ("userId") DO NOTHING
  `);

  const setFragments: Prisma.Sql[] = [];
  if (pgCols.has("updatedAt")) {
    setFragments.push(Prisma.sql`${Prisma.raw(`"updatedAt"`)} = NOW()`);
  }
  const skippedMissing: string[] = [];
  for (const key of Object.keys(payload)) {
    if (!CREATOR_PROFILE_RAW_UPDATABLE.has(key)) continue;
    const v = payload[key];
    if (v === undefined) continue;
    if (!pgCols.has(key)) {
      skippedMissing.push(key);
      continue;
    }
    setFragments.push(Prisma.sql`${Prisma.raw(`"${key}"`)} = ${v as never}`);
  }
  if (
    process.env.NODE_ENV === "development" &&
    skippedMissing.length > 0
  ) {
    console.warn(
      "[onboarding/creator/profile] Skipping columns not in DB — run `npx prisma migrate deploy` (migration 20260328120000):",
      skippedMissing.join(", "),
    );
  }
  if (setFragments.length === 0) {
    throw new Error(
      'creator_profiles has no updatable columns in current schema. Run `npx prisma migrate deploy` from the repo root.',
    );
  }

  await db.$executeRaw(Prisma.sql`
    UPDATE "creator_profiles"
    SET ${Prisma.join(setFragments, ", ")}
    WHERE "userId" = ${userId}
  `);

  return findCreatorProfileForOnboardingResponse(userId, pgCols);
}

const skillsList = [
  "Content Creation",
  "Photography",
  "Videography",
  "Graphic Design",
  "Social Media",
  "Copywriting",
  "Marketing",
  "Brand Strategy",
  "Web Design",
  "Animation",
  "SEO",
  "Development",
];

function trimMin2(value: unknown, fallback: string): string {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length >= 2 ? s : fallback;
}

/** Coerce hero-onboarding payloads so Grok/long text edge cases don’t 400 the save. */
const profileSchema = z.object({
  name: z.preprocess(
    (v) => {
      const s = typeof v === "string" ? v.trim().slice(0, 120) : "";
      return trimMin2(s, "Creator");
    },
    z.string().min(2),
  ),
  instagram: z.preprocess(
    (v) => {
      const s = typeof v === "string" ? v.replace(/^@+/, "").trim() : "";
      return s.length >= 2 ? s : "creator";
    },
    z.string().min(2),
  ),
  bio: z.string().max(280).optional(),
  location: z.preprocess(
    (v) => trimMin2(v, "Dubai, UAE"),
    z.string().min(2),
  ),
  skills: z.preprocess(
    (val) => {
      const arr = Array.isArray(val)
        ? val.map((x) => String(x).trim()).filter((s) => s.length > 0)
        : [];
      const out = arr.slice(0, 8);
      return out.length > 0 ? out : ["Content Creation"];
    },
    z.array(z.string().min(1)).min(1),
  ),
  niches: z.array(z.string().min(1)).optional().default([]),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  hourlyRate: z.string().optional(),
  prismArchetype: z.string().optional(),
  portfolioUrl: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null) return undefined;
      const s = String(v).trim();
      if (!s) return undefined;
      try {
        new URL(s);
        return s;
      } catch {
        return undefined;
      }
    }),
  primaryRole: z.string().optional(),
  rankedIndustries: z.array(z.string().min(1)).max(8).optional().default([]),
  yearsExperienceBand: z.string().optional(),
  preferredProjectTypes: z.array(z.string().min(1)).max(8).optional().default([]),
  preferredPace: z.string().optional(),
  feedbackStyle: z.string().optional(),
  howIWorkBest: z.string().optional(),
  suitedTeamScale: z.string().optional(),
  workEnvironmentFit: z.string().optional(),
  availabilityType: z.string().optional(),
  workModeOpenness: z.string().optional(),
  brandFitPreferences: z.array(z.string().min(1)).max(12).optional().default([]),
  clientValueStrengths: z.array(z.string().min(1)).max(12).optional().default([]),
  teamSetupPreference: z.string().optional(),
  prismArchetypeSecondary: z.string().optional(),
  generatedMatchTags: z
    .preprocess(
      (val) =>
        Array.isArray(val)
          ? val
              .map((x) => String(x).trim())
              .filter((s) => s.length > 0)
              .slice(0, 24)
          : [],
      z.array(z.string().min(1)).max(24).optional().default([]),
    ),
  onboardingTranscriptJson: z.unknown().optional(),
  onboardingAiSummary: z.preprocess(
    (v) => {
      if (v == null) return null;
      if (typeof v !== "string") return null;
      const t = v.trim();
      if (!t) return null;
      return t.slice(0, 4000);
    },
    z.string().max(4000).nullable().optional(),
  ),
  onboardingComplete: z.boolean().optional(),
});

const mapHourlyRate = (value?: string | null): number | null => {
  if (!value) return null;
  if (value.startsWith("25")) return 25;
  if (value.startsWith("50")) return 50;
  if (value.startsWith("100")) return 100;
  if (value.startsWith("200")) return 200;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Modal onboarding payload schema (accepts rateType/rateAmount + portfolioUrl)
const modalProfileSchema = z.object({
  name: z.string().min(2),
  instagram: z.string().min(2),
  bio: z.string().max(280).optional().default(""),
  location: z.string().min(2).optional().default("Dubai, UAE"),
  skills: z.array(z.string().min(1)).min(1),
  niches: z.array(z.string().min(1)).optional().default([]),
  prismArchetype: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  rateType: z.string().optional(),
  rateAmount: z.string().optional(),
});

function mapRateToHourly(rateType?: string, rateAmount?: string): number | null {
  if (!rateAmount) return null;
  const n = parseInt(rateAmount.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(n)) return null;
  if (rateType === "day_rate") return Math.round(n / 8);
  return mapHourlyRate(rateAmount) ?? n;
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let payload: unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = modalProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }
  const data = parsed.data;
  const hourlyRateValue = mapRateToHourly(data.rateType, data.rateAmount) ?? mapHourlyRate(data.rateAmount);

  const updateData = {
    name: data.name,
    instagram: data.instagram.replace(/^@+/, ""),
    bio: data.bio || null,
    location: data.location || "Dubai, UAE",
    skills: data.skills.filter(Boolean).slice(0, 5),
    niches: (data.niches || []).filter(Boolean).slice(0, 8),
    portfolioUrl: data.portfolioUrl || null,
    hourlyRate: hourlyRateValue ?? undefined,
    prismArchetype: data.prismArchetype || null,
    isActive: true,
  };

  const profile = await saveCreatorProfileForUser(user.id, updateData);

  if (user.role !== "CREATOR") {
    await db.user.update({ where: { id: user.id }, data: { role: "CREATOR" } });
  }
  try {
    const { generateUserAgreement } = await import("@/server/user-agreement");
    await generateUserAgreement(user.id, false);
  } catch { /* non-blocking */ }

  return NextResponse.json({ ok: true, profile: { id: profile.id, name: profile.name } });
}

export async function GET() {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const profile = await db.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({
    profile: {
      name: profile.name ?? "",
      instagram: profile.instagram ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      skills: profile.skills ?? [],
      niches: profile.niches ?? [],
      avatarUrl: profile.avatarUrl ?? "",
      hourlyRate: profile.hourlyRate ?? null,
      portfolioUrl: profile.portfolioUrl ?? "",
      prismArchetype: profile.prismArchetype ?? null,
      primaryRole: profile.primaryRole ?? null,
      rankedIndustries: profile.rankedIndustries ?? [],
      yearsExperienceBand: profile.yearsExperienceBand ?? null,
      preferredProjectTypes: profile.preferredProjectTypes ?? [],
      preferredPace: profile.preferredPace ?? null,
      feedbackStyle: profile.feedbackStyle ?? null,
      howIWorkBest: profile.howIWorkBest ?? null,
      suitedTeamScale: profile.suitedTeamScale ?? null,
      workEnvironmentFit: profile.workEnvironmentFit ?? null,
      availabilityType: profile.availabilityType ?? null,
      workModeOpenness: profile.workModeOpenness ?? null,
      brandFitPreferences: profile.brandFitPreferences ?? [],
      clientValueStrengths: profile.clientValueStrengths ?? [],
      teamSetupPreference: profile.teamSetupPreference ?? null,
      prismArchetypeSecondary: profile.prismArchetypeSecondary ?? null,
      generatedMatchTags: profile.generatedMatchTags ?? [],
      onboardingCompletedAt: profile.onboardingCompletedAt ?? null,
    },
  });
}

export async function PUT(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const hourlyRateValue = mapHourlyRate(data.hourlyRate);
  const mergedNiches = [
    ...(data.niches || []),
    ...(data.rankedIndustries || []),
  ]
    .map((n) => String(n).trim())
    .filter(Boolean);
  const uniqueNiches = [...new Set(mergedNiches.map((n) => n.toLowerCase()))]
    .slice(0, 12)
    .map((low) => mergedNiches.find((x) => x.toLowerCase() === low) ?? low);

  const transcriptJson = toPrismaJson(data.onboardingTranscriptJson);

  const profilePayload = omitUndefined({
    name: data.name,
    instagram: data.instagram,
    bio: data.bio ?? null,
    location: data.location,
    skills: data.skills.filter(Boolean).slice(0, 8),
    niches: uniqueNiches,
    avatarUrl: data.avatarUrl || null,
    hourlyRate: hourlyRateValue ?? undefined,
    prismArchetype: data.prismArchetype || null,
    portfolioUrl: data.portfolioUrl?.trim() || null,
    primaryRole: data.primaryRole?.trim() || null,
    rankedIndustries: (data.rankedIndustries || []).slice(0, 5),
    yearsExperienceBand: data.yearsExperienceBand?.trim() || null,
    preferredProjectTypes: (data.preferredProjectTypes || []).slice(0, 8),
    preferredPace: data.preferredPace?.trim() || null,
    feedbackStyle: data.feedbackStyle?.trim() || null,
    howIWorkBest: data.howIWorkBest?.trim() || null,
    suitedTeamScale: data.suitedTeamScale?.trim() || null,
    workEnvironmentFit: data.workEnvironmentFit?.trim() || null,
    availabilityType: data.availabilityType?.trim() || null,
    workModeOpenness: data.workModeOpenness?.trim() || null,
    brandFitPreferences: (data.brandFitPreferences || []).slice(0, 12),
    clientValueStrengths: (data.clientValueStrengths || []).slice(0, 12),
    teamSetupPreference: data.teamSetupPreference?.trim() || null,
    prismArchetypeSecondary: data.prismArchetypeSecondary?.trim() || null,
    generatedMatchTags: (data.generatedMatchTags || []).slice(0, 24),
    onboardingAiSummary: data.onboardingAiSummary ?? undefined,
    onboardingCompletedAt: data.onboardingComplete ? new Date() : undefined,
    isActive: true,
    ...(transcriptJson !== undefined ? { onboardingTranscriptJson: transcriptJson } : {}),
  });

  try {
    const profile = await saveCreatorProfileForUser(user.id, profilePayload);

    if (user.role !== "CREATOR") {
      await db.user.update({
        where: { id: user.id },
        data: { role: "CREATOR" },
      });
    }

    try {
      const { generateUserAgreement } = await import("@/server/user-agreement");
      await generateUserAgreement(user.id, false);
    } catch {
      // Non-blocking: agreement can be generated later via dashboard
    }

    return NextResponse.json({
      ok: true,
      profile: {
        id: profile.id,
        name: profile.name,
        username: profile.instagram ?? profile.id,
        location: profile.location,
        skills: profile.skills,
        niches: profile.niches,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
      },
    });
  } catch (e) {
    console.error("[onboarding/creator/profile PUT]", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "This profile conflicts with an existing record. Try again or contact support." },
        { status: 409 },
      );
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2022") {
      return NextResponse.json(
        {
          error:
            "Database is missing creator profile columns. Deploy migration 20260328120000_creator_profile_prism_onboarding_fields (or run `npx prisma migrate deploy`).",
        },
        { status: 500 },
      );
    }
    const { message, statusCode } = handleDatabaseError(e);
    const devDetail = process.env.NODE_ENV === "development" ? message : null;
    return NextResponse.json(
      {
        error: devDetail
          ? `${message} (dev)`
          : "Could not save your profile. Please try again in a moment.",
      },
      { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 },
    );
  }
}
