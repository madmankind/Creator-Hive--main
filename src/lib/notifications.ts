import { db } from "@/server/db";

export type NotificationType =
  | "talent_replaced"
  | "talent_added"
  | "talent_removed"
  | "campaign_message"
  | "campaign_update"
  | "booking_confirmed"
  | "replacement_proposed";

export async function createNotification({
  userId, type, title, message, campaignId, data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  campaignId?: string;
  data?: Record<string, unknown>;
}) {
  await db.$executeRawUnsafe(
    `INSERT INTO creatorhive.notifications (id, "userId", type, title, message, data, "isRead", "campaignId", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, false, $6, NOW(), NOW())`,
    userId, type, title, message,
    data ? JSON.stringify(data) : null,
    campaignId ?? null,
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  const rows = await db.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint as count FROM creatorhive.notifications
    WHERE "userId" = ${userId} AND "isRead" = false
  `;
  return Number(rows[0]?.count ?? 0);
}
