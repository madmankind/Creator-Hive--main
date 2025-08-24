import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const acct = await prisma.stripeAccount.findUnique({
    where: { userId: session.user.id },
    select: { accountId: true, chargesEnabled: true, payoutsEnabled: true },
  });

  return NextResponse.json(acct ?? { accountId: null, chargesEnabled: false, payoutsEnabled: false });
}

