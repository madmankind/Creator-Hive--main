import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OnboardingStep1Client from "./client";
import { redirectByRole } from "@/server/authz";
import { ensureLegalAccepted } from "@/server/legal-gate";
import { ensureCreatorOnboardingStarted } from "@/server/creatorOnboardingStart";

type SearchParams = { from?: string };

/**
 * Talent sign-in with ?from=talent skips the hiring-vs-creator gate and returns home
 * (?continueTalentOnboarding=1) for the hero bar intake + Grok coach flow.
 */
export default async function OnboardingStep1Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  if (session.user.role !== "CREATOR") {
    redirect(redirectByRole(session.user.role));
  }

  const q = await searchParams;
  const legalReturnTo =
    q.from === "talent" ? "/?continueTalentOnboarding=1" : "/onboarding/step-1";
  await ensureLegalAccepted(legalReturnTo);

  if (q.from === "talent") {
    await ensureCreatorOnboardingStarted(session.user.id, {
      email: session.user.email ?? "",
      name: session.user.name,
      role: session.user.role as "CREATOR",
    });
    redirect("/?continueTalentOnboarding=1");
  }

  return <OnboardingStep1Client />;
}
