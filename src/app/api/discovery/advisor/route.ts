import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

// POST — submit advisor request
export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let payload: Record<string, unknown> = {};
  try { payload = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const request = await db.advisorRequest.create({
    data: {
      userId: user.id,
      contactMethod: (payload.contactMethod as string) || "email",
      preferredTiming: (payload.preferredTiming as string) || "this_week",
      note: (payload.note as string) || null,
      source: (payload.source as string) || null,
    },
  });

  // Also mark discovery brief as advisor-requested if it exists
  await db.discoveryBrief.updateMany({
    where: { userId: user.id },
    data: { advisorRequested: true },
  });

  return NextResponse.json({ request });
}
