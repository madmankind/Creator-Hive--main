export function Comparison() {
  const rows = [
    {
      feature: "Time to start",
      creatorHive: "2–5 days",
      agencies: "6–8 weeks", 
      marketplace: "Varies"
    },
    {
      feature: "Pre-vetted talent",
      creatorHive: "Yes",
      agencies: "Mixed",
      marketplace: "Rare"
    },
    {
      feature: "Scope & milestones",
      creatorHive: "First-class",
      agencies: "Depends",
      marketplace: "DIY"
    },
    {
      feature: "Contracts & IP",
      creatorHive: "Built-in",
      agencies: "Yes (expensive)",
      marketplace: "You handle"
    },
    {
      feature: "Cost transparency",
      creatorHive: "Clear",
      agencies: "Opaque",
      marketplace: "Fees add up"
    },
    {
      feature: "Replacement guarantee",
      creatorHive: "Included",
      agencies: "Sometimes",
      marketplace: "No"
    }
  ];

  return (
    <section className="container py-24">
      <h2 className="text-3xl font-bold">Get the work. Skip the drag.</h2>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm border border-[color:var(--color-border)] rounded-xl overflow-hidden">
          <thead className="bg-[color:var(--grey-900)]">
            <tr>
              <th className="text-left px-6 py-4 border-b border-[color:var(--color-border)]">Feature</th>
              <th className="text-left px-6 py-4 border-b border-[color:var(--color-border)] text-[color:var(--accent-to)]">Creator Hive</th>
              <th className="text-left px-6 py-4 border-b border-[color:var(--color-border)]">Agencies</th>
              <th className="text-left px-6 py-4 border-b border-[color:var(--color-border)]">Marketplace</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.feature} className={i < rows.length - 1 ? "border-b border-[color:var(--color-border)]" : ""}>
                <td className="px-6 py-4 font-medium">{row.feature}</td>
                <td className="px-6 py-4 text-[color:var(--accent-to)]">{row.creatorHive}</td>
                <td className="px-6 py-4 text-[color:var(--color-muted-foreground)]">{row.agencies}</td>
                <td className="px-6 py-4 text-[color:var(--color-muted-foreground)]">{row.marketplace}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
