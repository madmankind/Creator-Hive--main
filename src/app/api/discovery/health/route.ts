export const dynamic = "force-dynamic";

import { requireUser } from "@/server/authz";

export async function GET() {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;

  return Response.json({
    ok: true,
    message: "Discovery data served from database",
    source: "database",
  });
}
