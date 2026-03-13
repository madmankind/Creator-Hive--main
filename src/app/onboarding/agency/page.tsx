import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AgencyOnboardingClient } from "./AgencyOnboardingClient";

export default async function AgencyOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/?signin=required");
  if (session.user.role === "CREATOR") redirect("/dashboard/creator");
  return <AgencyOnboardingClient />;
}
