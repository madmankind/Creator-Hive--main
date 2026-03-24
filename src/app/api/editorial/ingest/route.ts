import { NextResponse } from "next/server";
import { runFullIngestion } from "@/lib/editorial/ingest";

export const maxDuration = 60; // Vercel function timeout
export const dynamic = "force-dynamic";

/**
 * POST /api/editorial/ingest
 * Trigger: Vercel cron (every 4 hours) or manual admin call.
 * Auth: CRON_SECRET header must match env var.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow if CRON_SECRET matches, or if no secret is set (local dev)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runFullIngestion();
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[editorial] Ingestion route error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
