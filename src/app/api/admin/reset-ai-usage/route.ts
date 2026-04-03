import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

/** Admin-only: reset AI usage counts for today */
export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const body = await req.json().catch(() => ({}));
  const feature = body.feature ?? "ai_search";
  const userId = body.userId ?? undefined;

  const where = userId ? { feature, userId } : { feature };
  const result = await db.aiUsage.deleteMany({ where });

  return NextResponse.json({ ok: true, deleted: result.count, feature });
}
