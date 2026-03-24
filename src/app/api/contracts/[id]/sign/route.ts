import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const signSchema = z.object({
  signature: z.string().min(2), // Display name as signature
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { signature } = signSchema.parse(await req.json());

  const contract = await db.contract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let updateData: Record<string, unknown> = {};
  const now = new Date();

  if (auth.user.role === "CREATOR") {
    updateData = { creatorSignedAt: now, creatorSignature: signature };
    if (contract.agencySignedAt) updateData.status = "FULLY_SIGNED";
    else updateData.status = "AGENCY_SIGNED";
  } else {
    updateData = { agencySignedAt: now, agencySignature: signature };
    if (contract.creatorSignedAt) updateData.status = "FULLY_SIGNED";
    else updateData.status = "SENT";
  }

  const updated = await db.contract.update({
    where: { id },
    data: updateData,
    include: { milestones: true },
  });

  return NextResponse.json({ contract: updated });
}
