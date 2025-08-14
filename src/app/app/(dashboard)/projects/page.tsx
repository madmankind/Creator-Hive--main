export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const rows = [
    { name: "Campaign Shoot", client: "Brand A", milestone: "Edit v2", budget: "AED 6,000", daysLeft: 5 },
  ];
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Projects</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[color:var(--color-border)] rounded-xl overflow-hidden">
          <thead className="bg-[color:var(--grey-900)]">
            <tr>
              {['Project','Client','Milestone','Budget','Days Left','Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 border-b border-[color:var(--color-border)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-[color:var(--color-border)]">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.client}</td>
                <td className="px-4 py-3">{r.milestone}</td>
                <td className="px-4 py-3">{r.budget}</td>
                <td className="px-4 py-3">{r.daysLeft}</td>
                <td className="px-4 py-3"><Badge variant="success">Active</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


