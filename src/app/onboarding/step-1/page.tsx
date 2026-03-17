import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { headers } from "next/headers";
import OnboardingStep1Client from "./client";
import { redirectByRole } from "@/server/authz";
import { ensureLegalAccepted } from "@/server/legal-gate";

export default async function OnboardingStep1Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  if (session.user.role !== "CREATOR") {
    redirect(redirectByRole(session.user.role));
  }
  const pathname = (await headers()).get("x-pathname") ?? "/onboarding/step-1";
  await ensureLegalAccepted(pathname);
  return <OnboardingStep1Client />;
}
