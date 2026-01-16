import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { createSupabaseServiceClient } from "@/lib/supabase";

async function assertAccess(campaignId: string, user: { id: string; email: string; name?: string | null; role: string }) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (user.role === "ADMIN") return { campaign };
  const agency = await getOrCreateAgency(user);
  if (campaign.agencyId !== agency.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { campaign };
}

export async function GET(_: Request, context: { params: Promise<{ campaignId: string; fileId: string }> }) {
  const { campaignId, fileId } = await context.params;
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const access = await assertAccess(campaignId, user);
  if ("error" in access) return access.error;

  const file = await (db as any).campaignFile.findUnique({
    where: { id: fileId },
  });

  if (!file || file.campaignId !== campaignId) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage
    .from(file.storageBucket)
    .createSignedUrl(file.storagePath, 60 * 60); // 1 hour

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || "Failed to generate download URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
