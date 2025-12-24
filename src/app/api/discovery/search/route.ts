import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export const dynamic = "force-dynamic";

type Sort = { field?: string; direction?: "asc" | "desc" };
type FollowersRange = { min?: number; max?: number };
type Range = { min?: number };
type FilterBody = {
  keywords?: string;
  roles?: string[];
  locations?: string[];
  languages?: string[];
  interests?: string[];
  brands?: string[];
  followers?: FollowersRange;
  engagementRate?: Range;
  platforms?: string[];
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
  const ignoredFilters: string[] = [];

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

  if (filter.locations?.length) {
    const baseAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
    where.AND = [
      ...baseAnd,
      {
        OR: filter.locations.map((loc) => ({
          location: { contains: loc, mode: "insensitive" },
        })),
      },
    ];
  }

  // Unsupported filters (not in schema) are acknowledged but ignored
  ([
    ["languages", filter.languages],
    ["brands", filter.brands],
    ["followers", filter.followers],
    ["engagementRate", filter.engagementRate],
    ["platforms", filter.platforms],
  ] as const).forEach(([name, value]) => {
    if (value != null && ((Array.isArray(value) && value.length) || (!Array.isArray(value) && value))) {
      ignoredFilters.push(name);
    }
  });

  if (filter.interests?.length) {
    where.niches = { hasSome: filter.interests };
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

  const data = creators.map((creator) => ({
    id: creator.id,
    username: creator.instagram ?? creator.id,
    fullName: creator.name,
    followers: null,
    engagementRate: null,
    engagement: null,
    location: creator.location,
    languages: [],
    interests: creator.niches ?? [],
    brands: [],
    roles: creator.skills ?? [],
    avatarUrl: creator.avatarUrl,
    bio: creator.bio,
  }));

  const hasMore = page * pageSize + creators.length < total;

  return Response.json({
    data,
    meta: {
      page,
      pageSize,
      hasMore,
      total,
      ignoredFilters,
      source: "database",
    },
  });
}
