export function Proof() {
  const stats = [
    {
      title: "Higher on-time delivery",
      description: "Milestones and approvals keep work moving."
    },
    {
      title: "Lower admin load", 
      description: "Contracts, invoices, payouts in one flow."
    },
    {
      title: "Better creative fit",
      description: "Matches based on brief, budget, and style."
    }
  ];

  return (
    <section className="container py-24">
      <h2 className="text-3xl font-bold">Outcomes that compound</h2>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)] p-6">
            <h3 className="font-medium text-lg">{stat.title}</h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{stat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
