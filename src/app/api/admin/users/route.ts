import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      agencyAccount: { select: { id: true, name: true } },
      creatorProfile: { select: { id: true, talentStatus: true, isActive: true, qualityScore: true } },
      userAgreements: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, agreementRef: true, status: true, storageUrl: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({ users });
}
