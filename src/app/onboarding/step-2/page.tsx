import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BuildProfileClient from "./client";
import { redirectByRole } from "@/server/authz";

export default async function OnboardingStep2Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  if (session.user.role !== "CREATOR") {
    redirect(redirectByRole(session.user.role));
  }
  return <BuildProfileClient />;
}
