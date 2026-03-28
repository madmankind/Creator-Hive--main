import { NextResponse } from "next/server";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { db } from "@/server/db";

/** Rep / studio user (CREATOR role) — ensure AgencyAccount + metadata on agency record. */
export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let body: {
    entityName?: string;
    repName?: string;
    repEmail?: string;
    repSocial?: string;
    talentKinds?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const agency = await getOrCreateAgency(user);

  const name = (body.entityName ?? "").trim() || agency.name;
  const industryHint = (body.talentKinds ?? "").trim() || null;
  const instagram = (body.repSocial ?? "").replace(/^@+/, "").trim() || null;

  try {
    await db.agencyAccount.update({
      where: { id: agency.id },
      data: {
        name,
        ...(industryHint ? { industry: industryHint.slice(0, 200) } : {}),
        ...(instagram ? { instagramHandle: instagram } : {}),
      },
    });
  } catch {
    /* mock agency id in dev */
  }

  return NextResponse.json({
    ok: true,
    agencyId: agency.id,
    repEmail: body.repEmail?.trim() ?? user.email,
    repName: body.repName?.trim() ?? user.name,
  });
}
