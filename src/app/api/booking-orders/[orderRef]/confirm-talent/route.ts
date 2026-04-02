import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { sendTalentConfirmation } from "@/lib/email";
import { curatedTalent } from "@/lib/curatedTalent";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { orderRef } = await params;
  const body: { confirmedTalentIds?: string[]; replacedTalentIds?: string[]; replacementNote?: string } =
    await req.json().catch(() => ({}));

  const order = await (db as any).bookingOrder.findUnique({ where: { orderRef } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const confirmedIds: string[] = body.confirmedTalentIds ?? [];
  const replacedIds: string[] = body.replacedTalentIds ?? [];
  const replaced = replacedIds.length > 0;

  const talentNames = confirmedIds.map((id) => {
    const t = curatedTalent.find((c) => c.id === id);
    return t ? (t.displayName ?? t.name) : id;
  });

  const newToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await (db as any).bookingOrder.update({
    where: { orderRef },
    data: {
      confirmedTalentIds: confirmedIds,
      replacedTalentIds: replacedIds,
      status: "TALENT_CONFIRMED",
      talentConfirmedAt: new Date(),
      clientActionToken: newToken,
      expiresAt,
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://creatorhive.ae";
  const tokenBase = `${base}/booking/${orderRef}/respond?token=${newToken}`;

  void sendTalentConfirmation(order.clientEmail, {
    orderRef,
    clientName: order.clientName,
    talentNames,
    replaced,
    replacementNote: body.replacementNote,
    approveUrl: `${tokenBase}&action=approve`,
    replaceUrl: `${tokenBase}&action=replace`,
    cancelUrl: `${tokenBase}&action=cancel`,
  });

  return NextResponse.json({ ok: true, talentNames, replaced });
}
