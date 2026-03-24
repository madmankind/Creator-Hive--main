import { NextResponse } from "next/server";
import { z } from "zod";
import { CreatorShopProjectMode, CreatorShopProjectStatus, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const launchBrief = z.object({
  productConcept: z.string().min(1).max(8000),
  whyNow: z.string().max(2000).optional().or(z.literal("")),
  audience: z.string().min(1).max(8000),
  channels: z.string().min(1).max(8000),
  platformPresence: z.string().min(1).max(8000),
  launchTiming: z.string().min(1).max(2000),
  needFromHive: z.array(z.string()).min(1),
  existingAssets: z.string().max(8000).optional().or(z.literal("")),
  references: z.string().max(8000).optional().or(z.literal("")),
});

const growBrief = z.object({
  productName: z.string().min(1).max(500),
  traction: z.string().min(1).max(8000),
  mainIssue: z.string().min(1).max(2000),
  revenueBand: z.string().max(500).optional().or(z.literal("")),
  links: z.string().min(1).max(8000),
  needFromHive: z.array(z.string()).min(1),
  references: z.string().max(8000).optional().or(z.literal("")),
});

const createBody = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("LAUNCH"),
    productType: z.string().min(1).max(120),
    title: z.string().min(1).max(200),
    budgetBand: z.string().max(120).optional(),
    desiredLaunchDate: z.string().max(80).optional().or(z.literal("")),
    notes: z.string().max(8000).optional(),
    brief: launchBrief,
  }),
  z.object({
    mode: z.literal("GROW"),
    productType: z.string().min(1).max(120),
    title: z.string().min(1).max(200),
    budgetBand: z.string().max(120).optional(),
    currentPlatform: z.string().min(1).max(120),
    audienceContext: z.string().max(8000).optional(),
    notes: z.string().max(8000).optional(),
    brief: growBrief,
  }),
]);

function initialHistory(status: CreatorShopProjectStatus): Prisma.InputJsonValue {
  return [
    { status, at: new Date().toISOString(), label: status === "SUBMITTED" ? "Brief submitted" : "Created" },
  ];
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const agency = await db.agencyAccount.findUnique({
    where: { userId: auth.user.id },
    select: { id: true },
  });

  const rows = await db.creatorShopProject.findMany({
    where: {
      OR: [{ ownerUserId: auth.user.id }, ...(agency ? [{ agencyId: agency.id }] : [])],
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      mode: true,
      productType: true,
      title: true,
      status: true,
      updatedAt: true,
      latestUpdateAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ projects: rows });
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const agency = await db.agencyAccount.findUnique({
    where: { userId: auth.user.id },
    select: { id: true },
  });

  const data = parsed.data;
  const status: CreatorShopProjectStatus = "SUBMITTED";

  const briefPayload: Prisma.InputJsonValue =
    data.mode === "LAUNCH"
      ? { ...data.brief, mode: "LAUNCH" as const }
      : { ...data.brief, mode: "GROW" as const, currentPlatform: data.currentPlatform };

  let desiredLaunchDate: Date | null = null;
  if (data.mode === "LAUNCH" && data.desiredLaunchDate && data.desiredLaunchDate.trim() !== "") {
    const d = new Date(data.desiredLaunchDate);
    if (!Number.isNaN(d.getTime())) desiredLaunchDate = d;
  }

  const project = await db.creatorShopProject.create({
    data: {
      ownerUserId: auth.user.id,
      agencyId: agency?.id ?? null,
      mode: data.mode as CreatorShopProjectMode,
      productType: data.productType,
      title: data.title,
      status,
      briefPayload,
      budgetBand: data.budgetBand ?? null,
      desiredLaunchDate,
      currentPlatform: data.mode === "GROW" ? data.currentPlatform : null,
      audienceContext: data.mode === "GROW" ? data.audienceContext ?? null : null,
      notes: data.notes ?? null,
      statusHistory: initialHistory(status),
      latestUpdateAt: new Date(),
      commercialModelNotes:
        "Commercial structure (setup / launch fee, optional management, optional rev share) is confirmed after qualification — not shown at checkout.",
    },
    select: {
      id: true,
      title: true,
      status: true,
      mode: true,
      productType: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ project });
}
