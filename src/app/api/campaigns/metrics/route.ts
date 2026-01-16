import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";

export async function GET(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);
  const { searchParams } = new URL(req.url);
  const campaignIds = searchParams.get("campaignIds")?.split(",") || [];
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (campaignIds.length === 0) {
    return NextResponse.json({ error: "campaignIds required" }, { status: 400 });
  }

  const where: any = {
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

  // Group by date and aggregate
  const grouped = metrics.reduce((acc, metric) => {
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
  }, {} as Record<string, any>);

  return NextResponse.json({
    data: Object.values(grouped),
  });
}








