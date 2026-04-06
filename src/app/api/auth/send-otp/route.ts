import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { resend, FROM_EMAIL } from "@/lib/resend";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalised = email.toLowerCase().trim();

    // Check if user already exists
    let isExistingUser = false;
    try {
      const existing = await db.user.findUnique({ where: { email: normalised }, select: { id: true } });
      isExistingUser = !!existing;
    } catch { /* non-fatal */ }

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert — delete any existing token for this email, then create new
    await db.verificationToken.deleteMany({ where: { identifier: normalised } });
    await db.verificationToken.create({
      data: { identifier: normalised, token: otp, expires },
    });

    // Send via Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM_EMAIL,
        replyTo: "hello@creatorhive.ae",
        to: normalised,
        subject: `${otp} is your Creator Hive code`,
        html: `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#07070B;font-family:sans-serif;color:#fff;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#07070B;padding:40px 16px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td style="padding-bottom:28px;">
  <span style="font-size:18px;font-weight:700;color:#fff;">Creator Hive</span>
</td></tr>
<tr><td style="background:#0F1318;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:36px;text-align:center;">
  <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;">Your sign-in code</p>
  <p style="margin:0 0 24px;font-size:48px;font-weight:700;letter-spacing:0.15em;color:#fff;">${otp}</p>
  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4);">This code expires in 10 minutes. Don't share it with anyone.</p>
</td></tr>
<tr><td style="padding-top:20px;text-align:center;">
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">Creator Hive FZE · creatorhive.ae</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
      });
    }

    return NextResponse.json({ ok: true, isExistingUser });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}

export const maxDuration = 10;
