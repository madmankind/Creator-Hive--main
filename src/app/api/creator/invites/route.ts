import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const profile = await db.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return NextResponse.json({ data: [] });
  }

  const invites = await (db as any).campaignInvite.findMany({
    where: { creatorProfileId: profile.id },
    include: {
      campaign: {
        include: {
          agency: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: invites.map((invite: any) => ({
      id: invite.id,
      status: invite.status,
      note: invite.note,
      campaignId: invite.campaignId,
      campaignTitle: invite.campaign.title,
      campaignDueDate: invite.campaign.dueDate,
      agencyName: invite.campaign.agency?.name,
      createdAt: invite.createdAt,
    })),
  });
}
