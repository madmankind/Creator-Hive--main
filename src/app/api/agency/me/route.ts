import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getOrCreateAgency } from "@/server/agency";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const agency = await getOrCreateAgency(user);
  const talents = await db.creatorProfile.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: "desc" },
  });

  const pods = await db.podSelection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    agency,
    talents,
    pods,
  });
}
