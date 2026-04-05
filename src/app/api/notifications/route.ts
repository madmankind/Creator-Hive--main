import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.id;
  const limit = 30;

  const rows = await db.$queryRaw<{
    id: string; type: string; title: string; message: string;
    isRead: boolean; campaignId: string | null; data: unknown; createdAt: Date;
  }[]>`
    SELECT id, type, title, message, "isRead", "campaignId", data, "createdAt"
    FROM creatorhive.notifications
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
  `;

  const unreadCount = rows.filter(r => !r.isRead).length;
  return NextResponse.json({ notifications: rows, unreadCount });
}

export async function PATCH(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const userId = authResult.user.id;

  // Mark all as read
  await db.$executeRawUnsafe(
    `UPDATE creatorhive.notifications SET "isRead" = true, "updatedAt" = NOW() WHERE "userId" = $1`,
    userId
  );
  return NextResponse.json({ ok: true });
}
