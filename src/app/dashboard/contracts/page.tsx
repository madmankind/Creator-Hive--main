import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { ContractsDashboard } from "./ContractsDashboard";

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user) redirect("/?signin=required");
  const user = await db.user.findUnique({ where: { email: session.user.email! }, select: { id: true, role: true } }).catch(() => null);

  let contracts: any[] = [];
  if (user?.role === "CREATOR") {
    const profile = await db.creatorProfile.findUnique({ where: { userId: user.id }, select: { id: true } }).catch(() => null);
    if (profile) contracts = await db.contract.findMany({ where: { creatorProfileId: profile.id }, include: { milestones: true }, orderBy: { createdAt: "desc" } }).catch(() => []);
  } else {
    const agency = await db.agencyAccount.findUnique({ where: { userId: user!.id }, select: { id: true } }).catch(() => null);
    if (agency) contracts = await db.contract.findMany({ where: { agencyId: agency.id }, include: { milestones: true, creator: { select: { name: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" } }).catch(() => []);
  }

  return <ContractsDashboard contracts={contracts as any[]} role={user?.role ?? "AGENCY"} />;
}
