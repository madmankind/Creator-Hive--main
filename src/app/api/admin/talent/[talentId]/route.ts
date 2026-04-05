import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { trackAdminAction } from "@/server/admin-audit";

const VALID_TALENT_STATUSES = new Set(["pending", "active", "paused", "rejected"]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ talentId: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { talentId } = await params;

  let body: { talentStatus?: string; isActive?: boolean; qualityScore?: number } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.talentStatus && !VALID_TALENT_STATUSES.has(body.talentStatus)) {
    return NextResponse.json({ error: "Invalid talent status" }, { status: 400 });
  }

  try {
    const updated = await db.creatorProfile.update({
      where: { id: talentId },
      data: {
        ...(body.talentStatus !== undefined ? { talentStatus: body.talentStatus } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        ...(body.qualityScore !== undefined ? { qualityScore: body.qualityScore } : {}),
      },
      select: { id: true, talentStatus: true, isActive: true, qualityScore: true },
    });

    trackAdminAction(user.id, "talent_status_updated", { talentId, status: body.talentStatus ?? null });
    return NextResponse.json({ creator: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ talentId: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const { talentId } = await params;

  try {
    await db.creatorProfile.delete({ where: { id: talentId } });
    trackAdminAction(user.id, "talent_removed", { talentId });
    return NextResponse.json({ ok: true, deleted: talentId });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }
    throw error;
  }
}
