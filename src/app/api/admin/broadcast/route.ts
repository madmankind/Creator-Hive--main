import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { resend, FROM_EMAIL } from "@/lib/resend";

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { segment, subject, message } = await req.json().catch(() => ({}));
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "subject and message required" }, { status: 400 });
  }

  // Fetch all users with emails first, then filter by segment in JS
  const allUsers = await db.user.findMany({
    select: { id: true, email: true, role: true },
  });
  const withEmail = allUsers.filter(u => !!u.email);

  let targets: typeof withEmail = [];
  if (segment === "all") {
    targets = withEmail;
  } else if (segment === "clients") {
    targets = withEmail.filter(u => u.role === "AGENCY");
  } else if (segment === "talent") {
    targets = withEmail.filter(u => u.role === "CREATOR");
  } else if (segment === "pending_talent") {
    const pending = await db.creatorProfile.findMany({
      where: { talentStatus: "pending" },
      select: { userId: true },
    });
    const pendingIds = new Set(pending.map(p => p.userId).filter(Boolean));
    targets = withEmail.filter(u => pendingIds.has(u.id));
  } else if (segment === "no_booking") {
    const booked = await db.bookingRequest.findMany({ select: { userId: true } });
    const bookedIds = new Set(booked.map(b => b.userId));
    targets = withEmail.filter(u => u.role === "AGENCY" && !bookedIds.has(u.id));
  }

  const emails = targets.map(u => u.email!);
  if (!emails.length) return NextResponse.json({ ok: true, sent: 0, reason: "No recipients" });

  const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
    <p style="font-size:14px;line-height:1.7;color:#333;white-space:pre-wrap">${message.replace(/\n/g, "<br>")}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
    <p style="font-size:12px;color:#999">Creator Hive · creatorhive.ae</p>
  </div>`;

  let sent = 0;
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50);
    await Promise.allSettled(batch.map(to => resend.emails.send({ from: FROM_EMAIL, to, subject, html })));
    sent += batch.length;
  }

  return NextResponse.json({ ok: true, sent, total: emails.length });
}
