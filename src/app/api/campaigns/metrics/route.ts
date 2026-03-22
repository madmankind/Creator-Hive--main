import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";
import { assertCampaignIdsAccess } from "@/server/campaignAccess";

export async function GET(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN", "CREATOR"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { searchParams } = new URL(req.url);
  const campaignIds = searchParams.get("campaignIds")?.split(",").filter(Boolean) || [];
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (campaignIds.length === 0) {
    return NextResponse.json({ error: "campaignIds required" }, { status: 400 });
  }

  if (user.role === "CREATOR") {
    const denied = await assertCampaignIdsAccess(user, campaignIds);
    if (denied) return denied;
  } else {
    const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);
    const allowed = await db.campaign.findMany({
      where: {
        id: { in: campaignIds },
        ...(agency ? { agencyId: agency.id } : {}),
      },
      select: { id: true },
    });
    if (allowed.length !== campaignIds.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const where: {
    campaignId: { in: string[] };
    date?: { gte: Date; lte: Date };
  } = {
    campaignId: { in: campaignIds },
  };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const metrics = await db.campaignMetric.findMany({
    where,
    orderBy: { date: "asc" },
  });

  const grouped = metrics.reduce(
    (acc, metric) => {
      const dateKey = metric.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          views: 0,
          reach: 0,
          engagements: 0,
          spend: 0,
        };
      }
      acc[dateKey].views += metric.views;
      acc[dateKey].reach += metric.reach;
      acc[dateKey].engagements += metric.engagements;
      acc[dateKey].spend += Number(metric.spend);
      return acc;
    },
    {} as Record<
      string,
      { date: string; views: number; reach: number; engagements: number; spend: number }
    >,
  );

  return NextResponse.json({
    data: Object.values(grouped),
  });
}
