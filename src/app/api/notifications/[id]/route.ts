import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { id } = await params;
  await db.$executeRawUnsafe(
    `UPDATE creatorhive.notifications SET "isRead" = true, "updatedAt" = NOW() WHERE id = $1`,
    id
  );
  return NextResponse.json({ ok: true });
}
