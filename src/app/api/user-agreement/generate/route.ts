import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { generateUserAgreement } from "@/server/user-agreement";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";

  const result = await generateUserAgreement(auth.user.id, force);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    agreementRef: result.agreementRef,
    storageUrl: result.storageUrl,
  }, { status: 201 });
}
