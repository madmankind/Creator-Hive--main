import { NextResponse } from "next/server";
import type { User } from "@prisma/client";
import { requireUser } from "@/server/authz";
import { getOrCreateAgency } from "@/server/agency";
import { db } from "@/server/db";

function splitIndustries(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

async function upsertRepBootstrap(user: User, draft: Record<string, unknown>) {
  const agency = await getOrCreateAgency(user);
  const name = String(draft.repEntityName ?? "").trim() || agency.name;
  try {
    await db.agencyAccount.update({
      where: { id: agency.id },
      data: {
        name,
        industry: typeof draft.repTalentKinds === "string" ? draft.repTalentKinds.slice(0, 200) : undefined,
      },
    });
  } catch {
    /* dev mock */
  }
  return agency;
}

function pickInstagram(raw: string | undefined): string {
  const s = raw?.replace(/^@+/, "").trim() ?? "";
  return s.length >= 2 ? s : "pending";
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let body: { action?: string; draft?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action !== "commit_manual") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const draft = body.draft ?? {};
  const agency = await upsertRepBootstrap(user, draft);

  const talents: Array<Record<string, string | undefined>> = [];

  if (draft.t1_fullName) {
    talents.push({
      name: String(draft.t1_fullName),
      role: draft.t1_primaryRole ? String(draft.t1_primaryRole) : undefined,
      location: draft.t1_location ? String(draft.t1_location) : undefined,
      social: draft.t1_social ? String(draft.t1_social) : undefined,
      portfolio: draft.t1_portfolio ? String(draft.t1_portfolio) : undefined,
      industries: draft.t1_industries ? String(draft.t1_industries) : undefined,
      notes: draft.t1_notes ? String(draft.t1_notes) : undefined,
    });
  }
  if (draft.t2_fullName) {
    talents.push({
      name: String(draft.t2_fullName),
      role: draft.t2_primaryRole ? String(draft.t2_primaryRole) : undefined,
      location: draft.t2_location ? String(draft.t2_location) : undefined,
      social: draft.t2_social ? String(draft.t2_social) : undefined,
      portfolio: draft.t2_portfolio ? String(draft.t2_portfolio) : undefined,
    });
  }

  if (talents.length === 0) {
    return NextResponse.json({ error: "No talent rows" }, { status: 400 });
  }

  let saved = 0;
  for (const t of talents) {
    const displayName = (t.name ?? "").trim();
    if (!displayName) continue;
    try {
      await db.creatorProfile.create({
        data: {
          agencyId: agency.id,
          userId: null,
          name: displayName.slice(0, 120),
          instagram: pickInstagram(t.social),
          skills: [t.role ?? "Creator"].filter(Boolean) as string[],
          niches: [],
          location: t.location ?? null,
          portfolioUrl: t.portfolio?.trim() || null,
          primaryRole: t.role ?? null,
          bio: t.notes?.slice(0, 280) ?? null,
          rankedIndustries: splitIndustries(t.industries),
          talentStatus: "draft",
          source: "agency_hero_manual",
        },
      });
      saved++;
    } catch (e) {
      console.error("[talent-draft]", e);
    }
  }

  return NextResponse.json({ ok: true, saved });
}
