import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** GET /api/editorial/status — admin overview of ingestion health */
export async function GET() {
  const sources = await db.editorialSource.findMany({
    orderBy: { slug: "asc" },
    select: {
      slug: true, name: true, status: true, lastFetchAt: true, lastError: true,
      _count: { select: { items: true, runs: true } },
    },
  });

  const recentRuns = await db.editorialRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true, startedAt: true, finishedAt: true,
      itemsFound: true, itemsNew: true, itemsSkipped: true, error: true,
      source: { select: { slug: true } },
    },
  });

  const itemCounts = await db.editorialItem.groupBy({
    by: ["status"],
    _count: true,
  });

  return NextResponse.json({ sources, recentRuns, itemCounts });
}
