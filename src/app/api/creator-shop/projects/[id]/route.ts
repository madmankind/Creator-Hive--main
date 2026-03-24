import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const patchBody = z.object({
  notes: z.string().max(12000).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;

  const agency = await db.agencyAccount.findUnique({
    where: { userId: auth.user.id },
    select: { id: true },
  });

  const project = await db.creatorShopProject.findFirst({
    where: {
      id,
      OR: [{ ownerUserId: auth.user.id }, ...(agency ? [{ agencyId: agency.id }] : [])],
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ project });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;

  const agency = await db.agencyAccount.findUnique({
    where: { userId: auth.user.id },
    select: { id: true },
  });

  const allowed = await db.creatorShopProject.findFirst({
    where: {
      id,
      OR: [{ ownerUserId: auth.user.id }, ...(agency ? [{ agencyId: agency.id }] : [])],
    },
  });

  if (!allowed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.notes === undefined) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const project = await db.creatorShopProject.update({
    where: { id },
    data: {
      notes: parsed.data.notes,
      latestUpdateAt: new Date(),
    },
  });

  return NextResponse.json({ project });
}
