import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

const skillsList = [
  "Content Creation",
  "Photography",
  "Videography",
  "Graphic Design",
  "Social Media",
  "Copywriting",
  "Marketing",
  "Brand Strategy",
  "Web Design",
  "Animation",
  "SEO",
  "Development",
];

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  instagram: z.string().min(2, "Instagram handle required"),
  bio: z.string().max(280).optional(),
  location: z.string().min(2, "Location is required"),
  skills: z.array(z.string().min(1)).min(1, "Select at least one skill"),
  niches: z.array(z.string().min(1)).optional().default([]),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  hourlyRate: z.string().optional(),
  prismArchetype: z.string().optional(),
});

const mapHourlyRate = (value?: string | null): number | null => {
  if (!value) return null;
  if (value.startsWith("25")) return 25;
  if (value.startsWith("50")) return 50;
  if (value.startsWith("100")) return 100;
  if (value.startsWith("200")) return 200;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Modal onboarding payload schema (accepts rateType/rateAmount + portfolioUrl)
const modalProfileSchema = z.object({
  name: z.string().min(2),
  instagram: z.string().min(2),
  bio: z.string().max(280).optional().default(""),
  location: z.string().min(2).optional().default("Dubai, UAE"),
  skills: z.array(z.string().min(1)).min(1),
  niches: z.array(z.string().min(1)).optional().default([]),
  prismArchetype: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  rateType: z.string().optional(),
  rateAmount: z.string().optional(),
});

function mapRateToHourly(rateType?: string, rateAmount?: string): number | null {
  if (!rateAmount) return null;
  const n = parseInt(rateAmount.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(n)) return null;
  if (rateType === "day_rate") return Math.round(n / 8);
  return mapHourlyRate(rateAmount) ?? n;
}

export async function POST(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let payload: unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = modalProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }
  const data = parsed.data;
  const hourlyRateValue = mapRateToHourly(data.rateType, data.rateAmount) ?? mapHourlyRate(data.rateAmount);

  const updateData = {
    userId: user.id,
    name: data.name,
    instagram: data.instagram.replace(/^@+/, ""),
    bio: data.bio || null,
    location: data.location || "Dubai, UAE",
    skills: data.skills.filter(Boolean).slice(0, 5),
    niches: (data.niches || []).filter(Boolean).slice(0, 8),
    portfolioUrl: data.portfolioUrl || null,
    hourlyRate: hourlyRateValue ?? undefined,
    prismArchetype: data.prismArchetype || null,
    isActive: true,
  };

  const profile = await db.creatorProfile.upsert({
    where: { userId: user.id },
    update: updateData,
    create: updateData,
  });

  if (user.role !== "CREATOR") {
    await db.user.update({ where: { id: user.id }, data: { role: "CREATOR" } });
  }
  try {
    const { generateUserAgreement } = await import("@/server/user-agreement");
    await generateUserAgreement(user.id, false);
  } catch { /* non-blocking */ }

  return NextResponse.json({ ok: true, profile: { id: profile.id, name: profile.name } });
}

export async function GET() {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const profile = await db.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({
    profile: {
      name: profile.name ?? "",
      instagram: profile.instagram ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      skills: profile.skills ?? [],
      niches: profile.niches ?? [],
      avatarUrl: profile.avatarUrl ?? "",
      hourlyRate: profile.hourlyRate ?? null,
    },
  });
}

export async function PUT(req: Request) {
  const authResult = await requireUser({ roles: ["CREATOR", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const hourlyRateValue = mapHourlyRate(data.hourlyRate);

  const updateData: Prisma.CreatorProfileUpsertArgs["create"] = {
    userId: user.id,
    name: data.name,
    instagram: data.instagram.replace(/^@+/, ""),
    bio: data.bio,
    location: data.location,
    skills: data.skills.filter(Boolean).slice(0, 5),
    niches: (data.niches || []).filter(Boolean).slice(0, 8),
    avatarUrl: data.avatarUrl || null,
    hourlyRate: hourlyRateValue ?? undefined,
    prismArchetype: data.prismArchetype || null,
    isActive: true,
  };

  const profile = await db.creatorProfile.upsert({
    where: { userId: user.id },
    update: updateData,
    create: updateData,
  });

  // Ensure user role is creator
  if (user.role !== "CREATOR") {
    await db.user.update({
      where: { id: user.id },
      data: { role: "CREATOR" },
    });
  }

  // Generate User Agreement (idempotent; skips if already exists)
  try {
    const { generateUserAgreement } = await import("@/server/user-agreement");
    await generateUserAgreement(user.id, false);
  } catch {
    // Non-blocking: agreement can be generated later via dashboard
  }

  return NextResponse.json({
    ok: true,
    profile: {
      id: profile.id,
      name: profile.name,
      username: profile.instagram ?? profile.id,
      location: profile.location,
      skills: profile.skills,
      niches: profile.niches,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
    },
  });
}
