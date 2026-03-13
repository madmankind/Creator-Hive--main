import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET(req: Request) {
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  // Fetch open campaigns with briefs — public opportunities for creators
  const campaigns = await db.campaign.findMany({
    where: {
      status: { in: ["ACTIVE", "CONFIRMED_BRIEF_PENDING", "PROVISIONAL", "DRAFT"] },
    },
    include: {
      agency: { select: { name: true, location: true } },
      campaignBrief: { select: { primaryObjective: true, keyMessage: true, status: true } },
      _count: { select: { talents: true, invites: true } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // Enrich with relevant metadata
  const opportunities = campaigns.map(c => ({
    id: c.id,
    title: c.title,
    agencyName: c.agency.name,
    agencyLocation: c.agency.location,
    budget: c.budget,
    startDate: c.startDate,
    dueDate: c.dueDate,
    brief: c.campaignBrief?.keyMessage ?? c.brief?.slice(0, 160) ?? null,
    objective: c.campaignBrief?.primaryObjective,
    status: c.status,
    talentCount: c._count.talents,
    inviteCount: c._count.invites,
    createdAt: c.createdAt,
  }));

  return NextResponse.json({ opportunities });
}
