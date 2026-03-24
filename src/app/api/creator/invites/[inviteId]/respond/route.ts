import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const schema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
});

export async function POST(req: Request, context: { params: Promise<{ inviteId: string }> }) {
  const { inviteId } = await context.params;
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const profile = await db.creatorProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  let payload: z.infer<typeof schema>;
  try {
    payload = await schema.parseAsync(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues.map((i) => i.message).join(", ") : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const invite = await (db as any).campaignInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invite.creatorProfileId !== profile.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = payload.action === "ACCEPT" ? "ACCEPTED" : "DECLINED";

  const updated = await (db as any).campaignInvite.update({
    where: { id: inviteId },
    data: { status },
  });

  if (status === "ACCEPTED") {
    // Ensure campaign talent assignment exists
    await db.campaignTalent.upsert({
      where: {
        campaignId_talentId: {
          campaignId: updated.campaignId,
          talentId: updated.creatorProfileId,
        },
      },
      update: { status: "ASSIGNED" },
      create: {
        campaignId: updated.campaignId,
        talentId: updated.creatorProfileId,
        status: "ASSIGNED",
      },
    });
  }

  return NextResponse.json({ ok: true, status });
}
