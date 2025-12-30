import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OnboardingStep1Client from "./client";
import { redirectByRole } from "@/server/authz";

export default async function OnboardingStep1Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  if (session.user.role !== "CREATOR") {
    redirect(redirectByRole(session.user.role));
  }
  return <OnboardingStep1Client />;
}
