import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/authz";
import { db } from "@/server/db";

const CURRENT_LEGAL_VERSION = "2026-03";

const schema = z.object({
  version: z.string().optional(),
});

/** POST /api/legal-acceptance — record that the authenticated user accepted T&C */
export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  let body: { version?: string } = {};
  try { body = schema.parse(await req.json()); } catch { /* version is optional */ }

  const version = body.version ?? CURRENT_LEGAL_VERSION;

  await db.user.update({
    where: { id: auth.user.id },
    data: { legalAcceptedAt: new Date(), legalVersion: version },
  });

  return NextResponse.json({ ok: true, version, acceptedAt: new Date().toISOString() });
}

/** GET /api/legal-acceptance — check if current user has accepted */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const user = await db.user.findUnique({
    where: { id: auth.user.id },
    select: { legalAcceptedAt: true, legalVersion: true },
  });

  return NextResponse.json({
    accepted: !!user?.legalAcceptedAt,
    version: user?.legalVersion ?? null,
    acceptedAt: user?.legalAcceptedAt ?? null,
    currentVersion: CURRENT_LEGAL_VERSION,
    upToDate: user?.legalVersion === CURRENT_LEGAL_VERSION,
  });
}
