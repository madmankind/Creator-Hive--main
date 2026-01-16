import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";
import { requireUser } from "@/server/authz";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  brief: z.string().min(2).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  budget: z.number().int().nonnegative().optional(),
});

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: { talents: { include: { talent: true } } },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (agency && campaign.agencyId !== agency.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ campaign });
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const agency = user.role === "ADMIN" ? null : await getOrCreateAgency(user);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors.join(", ") }, { status: 400 });
  }

  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (agency && campaign.agencyId !== agency.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data: Parameters<typeof db.campaign.update>[0]["data"] = {
    ...("title" in parsed.data ? { title: parsed.data.title } : {}),
    ...("brief" in parsed.data ? { brief: parsed.data.brief } : {}),
    ...("status" in parsed.data ? { status: parsed.data.status } : {}),
    ...("budget" in parsed.data ? { budget: parsed.data.budget } : {}),
    ...("startDate" in parsed.data ? { startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null } : {}),
    ...("dueDate" in parsed.data ? { dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null } : {}),
  };

  const updated = await db.campaign.update({
    where: { id },
    data,
    include: { talents: { include: { talent: true } } },
  });

  return NextResponse.json({ ok: true, campaign: updated });
}
