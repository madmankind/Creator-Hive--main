import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DiscoveryClient from "./DiscoveryClient";
import { redirectByRole } from "@/server/authz";

export default async function DiscoveryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  if (session.user.role !== "AGENCY" && session.user.role !== "ADMIN") {
    redirect(redirectByRole(session.user.role));
  }
  return <DiscoveryClient />;
}
