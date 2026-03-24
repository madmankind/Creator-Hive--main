import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  if (user.role === "ADMIN") {
    const rows = await (db as any).walletTransaction.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: rows });
  }

  if (user.role === "AGENCY") {
    const agency = await getOrCreateAgency(user);
    const rows = await (db as any).walletTransaction.findMany({
      where: { agencyAccountId: agency.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: rows });
  }

  // CREATOR
  const profile = await db.creatorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ data: [] });
  const rows = await (db as any).walletTransaction.findMany({
    where: { creatorProfileId: profile.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: rows });
}
