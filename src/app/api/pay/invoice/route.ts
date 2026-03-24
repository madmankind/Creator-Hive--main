import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";

export async function POST() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  // Stub: pretend to queue invoice email
  return NextResponse.json({ ok: true, message: "Invoice queued" });
}
