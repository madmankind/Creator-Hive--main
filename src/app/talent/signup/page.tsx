import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Join Creator Hive — Talent",
  description: "Set up your Creator Hive creator profile.",
};

/**
 * Marketing wizard removed from this route — the live pipeline is
 * sign-in → legal → home talent bar (?continueTalentOnboarding=1) → Grok finalize.
 */
export default async function TalentSignupPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  redirect("/?continueTalentOnboarding=1");
}
