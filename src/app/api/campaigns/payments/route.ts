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
    createdAt?: { gte: Date; lte: Date };
  } = {
    campaignId: { in: campaignIds },
  };

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const payments = await db.campaignPayment.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  const grouped = payments.reduce(
    (acc, payment) => {
      const dateKey = payment.createdAt.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          amountCommitted: 0,
          amountInvoiced: 0,
          amountPaid: 0,
          outstandingBalance: 0,
        };
      }
      const amount = Number(payment.amount);
      if (payment.status === "COMMITTED") {
        acc[dateKey].amountCommitted += amount;
        acc[dateKey].outstandingBalance += amount;
      } else if (payment.status === "INVOICED") {
        acc[dateKey].amountInvoiced += amount;
        acc[dateKey].outstandingBalance += amount;
      } else if (payment.status === "PAID") {
        acc[dateKey].amountPaid += amount;
        acc[dateKey].outstandingBalance -= amount;
      }
      return acc;
    },
    {} as Record<
      string,
      {
        date: string;
        amountCommitted: number;
        amountInvoiced: number;
        amountPaid: number;
        outstandingBalance: number;
      }
    >,
  );

  return NextResponse.json({
    data: Object.values(grouped),
  });
}
