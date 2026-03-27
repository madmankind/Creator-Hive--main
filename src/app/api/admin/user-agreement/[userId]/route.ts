import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { generateUserAgreement } from "@/server/user-agreement";
import { trackAdminAction } from "@/server/admin-audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";

  const result = await generateUserAgreement(userId, force);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  trackAdminAction(user.id, "user_agreement_generated", { userId, force });

  return NextResponse.json(
    {
      agreementRef: result.agreementRef,
      storageUrl: result.storageUrl,
    },
    { status: 201 }
  );
}
