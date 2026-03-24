import { NextResponse } from "next/server";
import { db, dbExt } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await context.params;
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    select: { agencyId: true, title: true, budget: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (agency && campaign.agencyId !== agency.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await dbExt.campaignInvite.findMany({
    where: { campaignId },
    include: {
      creatorProfile: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: (invites as any[]).map((inv) => ({
      id: inv.id,
      status: inv.status,
      note: inv.note,
      createdAt: inv.createdAt,
      creatorProfileId: inv.creatorProfileId,
      creatorName: inv.creatorProfile?.name ?? "Creator",
      creatorEmail: inv.creatorProfile?.user?.email ?? null,
      creatorAvatar: inv.creatorProfile?.avatarUrl ?? null,
      creatorBio: inv.creatorProfile?.bio ?? null,
      creatorSkills: inv.creatorProfile?.skills ?? [],
    })),
  });
}
