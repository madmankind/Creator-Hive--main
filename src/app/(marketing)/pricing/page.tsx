export default function PricingPage() {
  return (
    <main className="container py-16">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)]">
          <div className="font-semibold">Starter</div>
          <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">0% platform, payment processing only</div>
        </div>
        <div className="p-6 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)]">
          <div className="font-semibold">Pro</div>
          <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">10–12% take on managed projects</div>
        </div>
        <div className="p-6 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)]">
          <div className="font-semibold">Enterprise</div>
          <div className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">Custom</div>
        </div>
      </div>
    </main>
  );
}


