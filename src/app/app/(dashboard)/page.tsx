export const dynamic = "force-dynamic";
import { Stat } from "@/components/ui/stat";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardHome() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Earnings" value="AED 28,420" delta={12.4} />
        <Stat label="Upcoming Payouts" value="AED 6,200" delta={3.2} />
        <Stat label="Active Projects" value="5" delta={-1.8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="text-sm text-[color:var(--color-muted-foreground)]">Recent Activity</div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Brand A – Campaign Shoot</div>
                <div className="text-sm text-[color:var(--success)]">+ AED 2,550</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Agency X – Scope Change (approved)</div>
                <div className="text-sm text-[color:var(--warning)]">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-[color:var(--color-muted-foreground)]">Compliance</div>
            <div className="mt-4 text-sm">Freelancer Permit: 90 days left</div>
            <div className="mt-2 h-2 rounded-full bg-[color:var(--grey-800)]">
              <div className="h-2 rounded-full bg-[color:var(--warning)]" style={{ width: "40%" }} />
            </div>
          </CardContent>
        </Card>
      </div>
      <EmptyState title="Discovery" description="Vetted creators and brands powered by performance data." />
    </div>
  );
}


