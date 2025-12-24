import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = user.role === "AGENCY" ? await getOrCreateAgency(user) : null;

  const invoices = await db.invoice.findMany({
    where: agency ? { agencyId: agency.id } : { talent: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      talent: true,
      campaign: true,
    },
  });

  return NextResponse.json({ data: invoices });
}
