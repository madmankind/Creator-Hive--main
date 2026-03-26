import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/editorial/re-enrich
 * Promotes PENDING/HIDDEN items to ENRICHED so they surface in Culture.
 * Safe to run multiple times — idempotent.
 */
async function handle(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const updated = await db.editorialItem.updateMany({
    where: { status: { in: ["PENDING", "HIDDEN"] } },
    data: { status: "ENRICHED" },
  });

  const total = await db.editorialItem.count({
    where: { status: { in: ["ENRICHED", "PUBLISHED"] } },
  });

  return NextResponse.json({ ok: true, promoted: updated.count, totalEnriched: total });
}

export const GET = handle;
export const POST = handle;
