import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { createNotification } from "@/lib/notifications";

type Ctx = { params: Promise<{ campaignId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { campaignId } = await params;

  const messages = await db.message.findMany({
    where: { campaignId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true, avatarUrl: true } } },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: Ctx) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { campaignId } = await params;
  const { content, recipientUserId, targetType } = await req.json().catch(() => ({}));
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  // Admin sender must have a creator profile or we use a system profile
  const adminProfile = await db.creatorProfile.findFirst({ where: { userId: authResult.user.id } });
  if (!adminProfile) return NextResponse.json({ error: "Admin creator profile not found" }, { status: 400 });

  const msg = await db.message.create({
    data: { campaignId, senderId: adminProfile.id, recipientId: recipientUserId ?? null, content },
  });

  // Notify recipient
  if (recipientUserId) {
    await createNotification({
      userId: recipientUserId, type: "campaign_message", campaignId,
      title: "New message on your campaign",
      message: content.slice(0, 120),
      data: { messageId: msg.id, targetType },
    });
  }

  return NextResponse.json({ ok: true, message: msg });
}
