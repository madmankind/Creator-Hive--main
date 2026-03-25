import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

// GET — fetch current user's discovery brief
export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const brief = await db.discoveryBrief.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ brief });
}

// POST / PUT — create or update discovery brief
export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let payload: Record<string, unknown> = {};
  try { payload = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = {
    primaryObjective: (payload.primaryObjective as string) || null,
    requestedRoles: (payload.requestedRoles as string[]) || [],
    startTiming: (payload.startTiming as string) || null,
    budgetRange: (payload.budgetRange as string) || null,
    companyName: (payload.companyName as string) || null,
    industry: (payload.industry as string) || null,
    notes: (payload.notes as string) || null,
    advisorRequested: Boolean(payload.advisorRequested),
    currentStep: typeof payload.currentStep === "number" ? payload.currentStep : 0,
    status: payload.completed ? "COMPLETE" as const : "INCOMPLETE" as const,
    completedAt: payload.completed ? new Date() : null,
  };

  const brief = await db.discoveryBrief.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  // Sync company name + industry to AgencyAccount if it exists
  if (data.companyName || data.industry) {
    try {
      await db.agencyAccount.updateMany({
        where: { userId: user.id },
        data: {
          ...(data.companyName ? { name: data.companyName } : {}),
          ...(data.industry ? { industry: data.industry } : {}),
        },
      });
    } catch { /* agency may not exist yet — that's fine */ }
  }

  return NextResponse.json({ brief });
}
