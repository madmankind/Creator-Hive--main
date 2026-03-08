import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ talentId: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { talentId } = await params;

  let body: { talentStatus?: string; isActive?: boolean; qualityScore?: number } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await db.creatorProfile.update({
    where: { id: talentId },
    data: {
      ...(body.talentStatus !== undefined ? { talentStatus: body.talentStatus } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(body.qualityScore !== undefined ? { qualityScore: body.qualityScore } : {}),
    },
    select: { id: true, talentStatus: true, isActive: true, qualityScore: true },
  });

  return NextResponse.json({ creator: updated });
}
