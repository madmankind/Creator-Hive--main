import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const schema = z.object({
  submissionNote: z.string().optional(),
  submissionFiles: z.array(z.string()).default([]),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const data = schema.parse(await req.json());
  const milestone = await db.milestone.update({
    where: { id },
    data: { ...data, status: "SUBMITTED", completedAt: new Date() },
  });
  return NextResponse.json({ milestone });
}
