export function ValueGrid() {
  const items = [
    ["Vetted talent", "Only creators with real results and strong portfolios."],
    ["Fast matching", "Shortlist in 48 hours, not 8 weeks."],
    ["Scope control", "Clear milestones. No guesswork, no scope-drift."],
    ["Built-in contracts", "Terms, IP, usage, and approvals—handled."],
    ["Compliance ready", "GCC-friendly invoicing and KYC."],
    ["Transparent fees", "No lock-ins, no hidden percentages."],
  ];
  return (
    <section className="container py-24">
      <h2 className="text-3xl font-bold">Why teams choose Creator Hive</h2>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {items.map(([title, desc]) => (
          <div key={title as string} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)] p-5 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,123,255,0.15)] transition">
            <div className="font-medium">{title}</div>
            <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


