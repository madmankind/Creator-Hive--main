import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const VALID_STATUSES = ["PROVISIONAL", "CONFIRMED_BRIEF_PENDING", "BRIEF_SENT", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DRAFT", "ACTIVE"] as const;
type ValidStatus = typeof VALID_STATUSES[number];

export async function GET(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as ValidStatus | null;

  const campaigns = await db.campaign.findMany({
    where: status && VALID_STATUSES.includes(status) ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      talents: {
        select: {
          id: true,
          talentId: true,
          status: true,
          rate: true,
          talent: { select: { name: true, displayName: true } },
        },
      },
      invites: {
        select: { id: true, status: true, creatorProfileId: true },
      },
    },
  });

  return NextResponse.json({ campaigns });
}
