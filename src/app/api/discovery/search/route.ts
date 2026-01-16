import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export const dynamic = "force-dynamic";
const isDev = process.env.NODE_ENV === "development";

type Sort = { field?: string; direction?: "asc" | "desc" };
type FilterBody = {
  keywords?: string;
  roles?: string[];
  platforms?: string[];
  location?: string;
  availability?: "hourly" | "monthly";
};
type Body = { page?: number; pageSize?: number; sort?: Sort; filter?: FilterBody };

const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;

const clampPageSize = (value?: number) => {
  if (!value || Number.isNaN(value)) return DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.min(MAX_PAGE_SIZE, value));
};

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;

  let payload: Body = {};
  try {
    payload = (await req.json()) as Body;
  } catch {
    // ignore invalid payloads and use defaults
  }

  const page = Math.max(0, payload.page ?? 0);
  const pageSize = clampPageSize(payload.pageSize);
  const filter = payload.filter ?? {};

  const where: Prisma.CreatorProfileWhereInput = {
    isActive: true,
  };

  const keywords = filter.keywords || (filter as { query?: string }).query || (filter as { q?: string }).q;
  if (keywords && typeof keywords === "string") {
    where.OR = [
      { name: { contains: keywords, mode: "insensitive" } },
      { instagram: { contains: keywords, mode: "insensitive" } },
      { bio: { contains: keywords, mode: "insensitive" } },
      { niches: { hasSome: [keywords] } },
      { skills: { hasSome: [keywords] } },
    ];
  }

  if (filter.roles?.length) {
    where.skills = { hasSome: filter.roles };
  }

  if (filter.location) {
    const baseAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
    where.AND = [
      ...baseAnd,
      {
        location: { contains: filter.location, mode: "insensitive" },
      },
    ];
  }

  if (filter.platforms?.length) {
    const platforms = new Set(filter.platforms.map((p) => p.toLowerCase()));
    const platformConditions: Prisma.CreatorProfileWhereInput[] = [];
    if (platforms.has("instagram") || platforms.has("ig")) {
      platformConditions.push({ instagram: { not: null } });
    }
    if (platformConditions.length) {
      where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), ...platformConditions];
    }
  }

  if (filter.availability === "hourly") {
    where.hourlyRate = { not: null };
  } else if (filter.availability === "monthly") {
    where.dayRate = { not: null };
  }

  const orderBy: Prisma.CreatorProfileOrderByWithRelationInput =
    payload.sort?.field === "name"
      ? { name: payload.sort?.direction === "asc" ? "asc" : "desc" }
      : { createdAt: "desc" };

  const [total, creators] = await Promise.all([
    db.creatorProfile.count({ where }),
    db.creatorProfile.findMany({
      where,
      orderBy,
      skip: page * pageSize,
      take: pageSize,
    }),
  ]);

  const data = creators.map((creator) => {
    const missing: string[] = [];
    if (!creator.name) missing.push("name");
    if (!creator.location) missing.push("location");
    if (!creator.skills?.length) missing.push("skills");

    if (isDev && missing.length) {
      // eslint-disable-next-line no-console
      console.warn(`Discovery result missing fields for creator ${creator.id}: ${missing.join(", ")}`);
    }

    return {
      id: creator.id,
      username: creator.instagram ?? creator.id,
      fullName: creator.name || creator.instagram || "Unknown",
      followers: null,
      engagementRate: null,
      engagement: null,
      location: creator.location || "Unknown",
      languages: [],
      interests: creator.niches ?? [],
      brands: [],
      roles: creator.skills ?? [],
      avatarUrl: creator.avatarUrl || undefined,
      bio: creator.bio || "",
    };
  });

  const hasMore = page * pageSize + creators.length < total;

  return Response.json({
    data,
    meta: {
      page,
      pageSize,
      hasMore,
      total,
      source: "database",
    },
  });
}
