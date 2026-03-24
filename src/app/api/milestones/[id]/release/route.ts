import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in auth) return auth.error;

  const milestone = await db.milestone.findUnique({ where: { id }, include: { contract: { select: { creatorProfileId: true } } } });
  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (milestone.status !== "SUBMITTED" && milestone.status !== "APPROVED") {
    return NextResponse.json({ error: "Milestone must be submitted before release" }, { status: 400 });
  }

  const updated = await db.milestone.update({
    where: { id },
    data: { status: "RELEASED", releasedAt: new Date() },
  });

  // Update creator total earned
  await db.creatorProfile.update({
    where: { id: milestone.contract.creatorProfileId },
    data: { totalEarned: { increment: milestone.amount } },
  }).catch(() => {});

  return NextResponse.json({ milestone: updated });
}
