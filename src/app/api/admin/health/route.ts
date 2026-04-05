import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { resend } from "@/lib/resend";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const [userCount, bookingCount, campaignCount, invoiceCount,
         aiUsageToday, pendingTalent, pendingBookings] = await Promise.all([
    db.user.count(),
    db.bookingRequest.count(),
    db.campaign.count(),
    db.invoice.count(),
    db.aiUsage.aggregate({ _sum: { count: true }, where: { day: new Date().toISOString().slice(0, 10) } }),
    db.creatorProfile.count({ where: { talentStatus: "pending" } }),
    db.bookingRequest.count({ where: { status: "PENDING" } }),
  ]);

  // Resend domain health
  let resendOk = false;
  try {
    const domains = await resend.domains.list();
    resendOk = (domains.data?.data ?? []).some((d: { name: string; status: string }) => d.name === "creatorhive.ae" && d.status === "verified");
  } catch { resendOk = false; }

  // DB health
  let dbOk = false;
  try { await db.$queryRaw`SELECT 1`; dbOk = true; } catch { dbOk = false; }

  return NextResponse.json({
    db: dbOk ? "healthy" : "error",
    email: resendOk ? "verified" : "unverified",
    stats: { userCount, bookingCount, campaignCount, invoiceCount,
             aiSearchesToday: Number(aiUsageToday._sum.count ?? 0),
             pendingTalent, pendingBookings },
    timestamp: new Date().toISOString(),
  });
}
