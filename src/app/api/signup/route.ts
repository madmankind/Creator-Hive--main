import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { userHasRole } from "@/server/authz";

type Body = {
  role: "AGENCY" | "CREATOR" | "ADMIN";
  email?: string;
  whatsapp?: string;
  instagram?: string;
};

export async function POST(req: Request) {
  let payload: Body | null = null;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.role || !userHasRole(payload.role, ["AGENCY", "CREATOR", "ADMIN"])) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!payload.email && !payload.whatsapp) {
    return NextResponse.json({ error: "Email or WhatsApp is required" }, { status: 400 });
  }

  await db.signupApplication.create({
    data: {
      role: payload.role,
      email: payload.email || "unknown@signup.local",
      whatsapp: payload.whatsapp,
      instagram: payload.instagram,
    },
  });

  return NextResponse.json({ ok: true });
}
