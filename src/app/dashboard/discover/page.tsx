import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardDiscovery from "./DashboardDiscoveryClient";
import { redirectByRole } from "@/server/authz";

export default async function DashboardDiscoverPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  if (session.user.role !== "AGENCY" && session.user.role !== "ADMIN") {
    redirect(redirectByRole(session.user.role));
  }
  return (
    <main className="min-h-screen bg-[#F6F7FB] px-7 py-6">
      <div className="mx-auto max-w-[1280px] space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-slate-900">Discover</h1>
            <p className="text-sm text-slate-600 mt-1">Curated Creator Hive directory</p>
          </div>
        </header>
        <div className="rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] p-4">
          <DashboardDiscovery />
        </div>
      </div>
    </main>
  );
}
