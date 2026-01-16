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
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const payments = await db.campaignPayment.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  // Aggregate by date and status
  const grouped = payments.reduce((acc, payment) => {
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
  }, {} as Record<string, any>);

  return NextResponse.json({
    data: Object.values(grouped),
  });
}








