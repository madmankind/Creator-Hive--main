import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const agency = user.role === "AGENCY" ? await getOrCreateAgency(user) : null;

  const invoices = await db.invoice.findMany({
    where: agency ? { agencyId: agency.id } : { talent: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      talent: true,
      campaign: true,
    },
  });

  return NextResponse.json({ data: invoices });
}
