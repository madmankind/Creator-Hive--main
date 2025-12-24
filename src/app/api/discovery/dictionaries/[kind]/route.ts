import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function getLocations() {
  const rows = await db.creatorProfile.findMany({
    where: { location: { not: null } },
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });
  return rows.map((row) => row.location!).filter(Boolean);
}

async function getInterests() {
  const rows = await db.creatorProfile.findMany({
    where: { niches: { isEmpty: false } },
    select: { niches: true },
  });
  const set = new Set<string>();
  rows.forEach((row) => {
    row.niches?.forEach((n) => n && set.add(n));
  });
  return Array.from(set);
}

const emptyDict = async () => [] as string[];

const resolvers: Record<string, () => Promise<string[]>> = {
  interests: getInterests,
  locations: getLocations,
  brands: emptyDict,
  languages: emptyDict,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { kind } = await params;
  const resolver = resolvers[kind];
  if (!resolver) {
    return new Response("Unknown dictionary", { status: 400 });
  }

  const entries = await resolver();

  const url = new URL(req.url);
  const query = (url.searchParams.get("query") || "").toLowerCase();
  const limit = Number(url.searchParams.get("limit") || "50");

  const filtered = entries
    .filter((value) => !query || value.toLowerCase().includes(query))
    .slice(0, Number.isFinite(limit) ? limit : 50)
    .map((value) => ({ id: value, name: value }));

  return Response.json({ data: filtered, meta: { total: entries.length, source: "database" } });
}
