import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { getUserAgreement } from "@/server/user-agreement";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const agreement = await getUserAgreement(auth.user.id);
  return NextResponse.json({ agreement });
}
