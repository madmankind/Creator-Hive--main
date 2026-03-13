import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const createSchema = z.object({
  creatorProfileId: z.string(),
  campaignId: z.string().optional(),
  title: z.string().min(2),
  content: z.string().min(10),
  totalAmount: z.number().int().optional(),
  currency: z.string().default("AED"),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    amount: z.number().int(),
    dueDate: z.string().optional(),
  })).optional(),
});

export async function GET(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  let contracts;
  if (auth.user.role === "CREATOR") {
    const profile = await db.creatorProfile.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ contracts: [] });
    contracts = await db.contract.findMany({
      where: { creatorProfileId: profile.id },
      include: { milestones: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    const agency = await db.agencyAccount.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
    if (!agency) return NextResponse.json({ contracts: [] });
    contracts = await db.contract.findMany({
      where: { agencyId: agency.id },
      include: { milestones: true, creator: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json({ contracts });
}

export async function POST(req: Request) {
  const auth = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in auth) return auth.error;

  const body = createSchema.parse(await req.json());
  const agency = await db.agencyAccount.findUnique({ where: { userId: auth.user.id }, select: { id: true } });

  const { milestones: mData, ...contractData } = body;
  const contract = await db.contract.create({
    data: {
      ...contractData,
      agencyId: agency?.id,
      status: "SENT",
      milestones: mData ? {
        create: mData.map(m => ({
          ...m,
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
        })),
      } : undefined,
    },
    include: { milestones: true },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
