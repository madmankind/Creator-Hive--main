import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardIndex() {
  const session = await auth();
  const role = (session?.user as { role?: string | null } | undefined)?.role ?? null;
  if (role === "CREATOR") {
    redirect("/dashboard/creator");
  }
  redirect("/dashboard/track");
}
