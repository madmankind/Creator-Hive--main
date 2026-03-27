import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { trackAdminAction } from "@/server/admin-audit";

const VALID_CAMPAIGN_STATUSES = new Set([
  "PROVISIONAL",
  "CONFIRMED_BRIEF_PENDING",
  "BRIEF_SENT",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DRAFT",
  "ACTIVE",
] as const);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      agency: { include: { user: { select: { id: true, name: true, email: true } } } },
      talents: {
        include: { talent: { select: { id: true, name: true, displayName: true, instagram: true, avatarUrl: true } } },
      },
      invites: {
        include: { creator: { select: { id: true, name: true, displayName: true, avatarUrl: true } } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 20 },
      campaignBrief: true,
    },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { id } = await params;
  let body: {
    status?: "PROVISIONAL" | "CONFIRMED_BRIEF_PENDING" | "BRIEF_SENT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "ACTIVE";
    title?: string;
    budget?: number;
    startDate?: string;
    dueDate?: string;
  } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.status && !VALID_CAMPAIGN_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Invalid campaign status" }, { status: 400 });
  }
  if (body.startDate && Number.isNaN(new Date(body.startDate).getTime())) {
    return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
  }
  if (body.dueDate && Number.isNaN(new Date(body.dueDate).getTime())) {
    return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
  }

  try {
    const updated = await db.campaign.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.budget !== undefined ? { budget: body.budget } : {}),
        ...(body.startDate !== undefined ? { startDate: new Date(body.startDate) } : {}),
        ...(body.dueDate !== undefined ? { dueDate: new Date(body.dueDate) } : {}),
      },
      select: {
        id: true,
        title: true,
        status: true,
        budget: true,
        startDate: true,
        dueDate: true,
        agency: { select: { id: true, name: true } },
      },
    });

    trackAdminAction(user.id, "campaign_updated", { campaignId: id, status: body.status ?? null });
    return NextResponse.json({ campaign: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    throw error;
  }
}
