import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireUser } from "@/server/authz";

export async function GET(req: Request) {
  const authResult = await requireUser({ roles: ["ADMIN"] });
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "7"), 30);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDay = since.toISOString().slice(0, 10);

  const rows = await db.aiUsage.findMany({
    where: { day: { gte: sinceDay } },
    orderBy: { day: "desc" },
  });

  // Aggregate by day
  const byDay: Record<string, number> = {};
  const byUser: Record<string, { total: number; days: string[] }> = {};
  for (const r of rows) {
    byDay[r.day] = (byDay[r.day] ?? 0) + r.count;
    if (r.userId) {
      if (!byUser[r.userId]) byUser[r.userId] = { total: 0, days: [] };
      byUser[r.userId].total += r.count;
      if (!byUser[r.userId].days.includes(r.day)) byUser[r.userId].days.push(r.day);
    }
  }

  // Enrich top users with names
  const topUserIds = Object.entries(byUser).sort((a, b) => b[1].total - a[1].total).slice(0, 20).map(([id]) => id);
  const users = topUserIds.length
    ? await db.user.findMany({ where: { id: { in: topUserIds } }, select: { id: true, name: true, email: true } })
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  const topUsers = topUserIds.map(id => ({
    id, ...byUser[id], name: userMap.get(id)?.name ?? "—", email: userMap.get(id)?.email ?? "—",
  }));

  const totalSearches = rows.reduce((s, r) => s + r.count, 0);
  const anonSearches = rows.filter(r => !r.userId).reduce((s, r) => s + r.count, 0);

  return NextResponse.json({ byDay, topUsers, totalSearches, anonSearches, days });
}
