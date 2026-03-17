import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("")),
  goals: z.array(z.string()).optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
});

export async function GET() {
  const auth = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const agency = await db.agencyAccount.findUnique({ where: { userId: auth.user.id } });
  return NextResponse.json({ agency });
}

export async function POST(req: Request) {
  const auth = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in auth) return auth.error;
  const { name, website, location } = schema.parse(await req.json());
  const agency = await db.agencyAccount.upsert({
    where: { userId: auth.user.id },
    update: { name, website: website || null, location: location || null },
    create: { userId: auth.user.id, name, website: website || null, location: location || null },
  });

  // Generate User Agreement (idempotent; skips if already exists)
  try {
    const { generateUserAgreement } = await import("@/server/user-agreement");
    await generateUserAgreement(auth.user.id, false);
  } catch {
    // Non-blocking: agreement can be generated later via dashboard
  }

  return NextResponse.json({ agency });
}

export async function PUT(req: Request) {
  return POST(req);
}
