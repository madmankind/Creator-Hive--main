export const dynamic = "force-dynamic";
import DashboardClient from "@/app/(dashboard)/DashboardClient";

export default function DashboardHome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardClient />
    </div>
  );
}