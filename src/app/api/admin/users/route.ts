import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  // Fetch users with block/suspend state via raw SQL (columns added outside Prisma migration)
  const rawUsers = await db.$queryRaw<{ id: string; isBlocked: boolean; isSuspended: boolean; blockedReason: string | null }[]>`
    SELECT id, "isBlocked", "isSuspended", "blockedReason"
    FROM creatorhive.users
  `;
  const blockMap = new Map(rawUsers.map(u => [u.id, u]));

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

  const enriched = users.map(u => ({
    ...u,
    isBlocked: blockMap.get(u.id)?.isBlocked ?? false,
    isSuspended: blockMap.get(u.id)?.isSuspended ?? false,
    blockedReason: blockMap.get(u.id)?.blockedReason ?? null,
  }));

  return NextResponse.json({ users: enriched });
}
