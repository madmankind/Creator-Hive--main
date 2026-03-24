import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(req.url);
  const contractId = searchParams.get("contractId");
  if (!contractId) return NextResponse.json({ error: "contractId required" }, { status: 400 });
  const milestones = await db.milestone.findMany({
    where: { contractId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ milestones });
}
