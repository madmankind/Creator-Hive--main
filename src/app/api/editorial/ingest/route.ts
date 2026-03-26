import { NextResponse } from "next/server";
import { runFullIngestion } from "@/lib/editorial/ingest";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // local dev — open
  const auth = req.headers.get("authorization");
  // Vercel cron sends it as Bearer token
  if (auth === `Bearer ${cronSecret}`) return true;
  // Also allow x-cron-secret header fallback
  if (req.headers.get("x-cron-secret") === cronSecret) return true;
  return false;
}

async function handle(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const results = await runFullIngestion();
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[editorial] Ingestion route error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Vercel crons call GET — must handle both
export const GET = handle;
export const POST = handle;
