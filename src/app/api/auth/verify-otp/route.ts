import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and code required" }, { status: 400 });
    }

    const normalised = email.toLowerCase().trim();

    const record = await db.verificationToken.findFirst({
      where: { identifier: normalised, token: String(otp) },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (new Date() > record.expires) {
      await db.verificationToken.delete({ where: { identifier_token: { identifier: normalised, token: String(otp) } } });
      return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
    }

    // Delete token — one-time use
    await db.verificationToken.delete({
      where: { identifier_token: { identifier: normalised, token: String(otp) } },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
