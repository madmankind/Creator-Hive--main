import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = await getOrCreateAgency(user);
  const talents = await db.creatorProfile.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: "desc" },
  });

  const pods = await db.podSelection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    agency,
    talents,
    pods,
  });
}
