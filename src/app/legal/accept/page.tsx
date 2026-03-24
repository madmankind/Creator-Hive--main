import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { LegalAcceptClient } from "./LegalAcceptClient";
import { Suspense } from "react";

export default async function LegalAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/?signin=required");
  }

  const returnTo = (await searchParams).returnTo || "/dashboard";

  const isDev = process.env.NODE_ENV !== "production";
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPlaceholderUrl =
    databaseUrl.includes("placeholder") ||
    databaseUrl.includes("user:password");

  if (!(isDev && (!databaseUrl || isPlaceholderUrl))) {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { legalAcceptedAt: true },
    });
    if (user?.legalAcceptedAt) {
      redirect(returnTo.startsWith("/") ? returnTo : "/dashboard");
    }
  }

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#07070B" }} />}>
      <LegalAcceptClient />
    </Suspense>
  );
}
