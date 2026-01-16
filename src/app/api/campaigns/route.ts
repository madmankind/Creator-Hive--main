import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  const campaigns = await db.campaign.findMany({
    where: agency ? { agencyId: agency.id } : undefined,
    select: {
      id: true,
      title: true,
      status: true,
      startDate: true,
      dueDate: true,
      budget: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.title,
      status: c.status,
      startDate: c.startDate,
      dueDate: c.dueDate,
      budget: c.budget,
    })),
  });
}








