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
    <main className="min-h-screen" style={{ background: "#07070A" }}>
      <div className="px-6 py-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>Discover</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>Curated Creator Hive directory</p>
          </div>
        </header>
        <div className="rounded-[18px] border p-4" style={{ 
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.08)"
        }}>
          <DashboardDiscovery />
        </div>
      </div>
    </main>
  );
}
