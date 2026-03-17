import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AgencyOnboardingClient } from "./AgencyOnboardingClient";
import { ensureLegalAccepted } from "@/server/legal-gate";

export default async function AgencyOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/?signin=required");
  if (session.user.role === "CREATOR") redirect("/dashboard/creator");
  const pathname = (await headers()).get("x-pathname") ?? "/onboarding/agency";
  await ensureLegalAccepted(pathname);
  return <AgencyOnboardingClient />;
}
