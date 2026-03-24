import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const contract = await db.contract.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
      creator: { select: { name: true, avatarUrl: true, instagram: true } },
    },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ contract });
}
