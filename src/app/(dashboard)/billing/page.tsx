import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BillingCard from "@/components/billing/BillingCard";

export default async function BillingPage() {
  await getServerSession(authOptions);
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Billing</h1>
      <BillingCard />
    </div>
  );
}