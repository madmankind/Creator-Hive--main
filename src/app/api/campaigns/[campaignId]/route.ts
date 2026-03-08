import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  const campaign = await db.campaign.findFirst({
    where: {
      id: campaignId,
      ...(agency ? { agencyId: agency.id } : {}),
    },
    include: {
      talents: {
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              instagram: true,
              skills: true,
              avatarUrl: true,
              hourlyRate: true,
              dayRate: true,
            },
          },
        },
      },
      metrics: {
        orderBy: { date: "desc" },
        take: 90,
      },
      payments: {
        orderBy: { dueDate: "asc" },
      },
      invites: {
        include: {
          creator: {
            select: { id: true, name: true, instagram: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { campaignId } = await params;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const campaign = await db.campaign.findFirst({
    where: {
      id: campaignId,
      ...(agency ? { agencyId: agency.id } : {}),
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const updated = await db.campaign.update({
    where: { id: campaignId },
    data: {
      ...(body.title ? { title: String(body.title) } : {}),
      ...(body.status ? { status: body.status as never } : {}),
      ...(body.budget !== undefined ? { budget: Number(body.budget) } : {}),
      ...(body.startDate ? { startDate: new Date(String(body.startDate)) } : {}),
      ...(body.dueDate ? { dueDate: new Date(String(body.dueDate)) } : {}),
    },
  });

  return NextResponse.json({ campaign: updated });
}
