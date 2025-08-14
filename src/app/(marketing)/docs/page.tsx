export default function DocsPage() {
  return (
    <main className="container py-16">
      <h1 className="text-3xl font-bold">How we vet & work</h1>
      <p className="mt-4 text-[color:var(--color-muted-foreground)]">Discover → Book → Execute → Track.</p>
      <ol className="mt-6 space-y-3 list-decimal list-inside text-sm text-[color:var(--color-muted-foreground)]">
        <li>Creators apply with portfolios and recent performance.</li>
        <li>We verify identity, licensing, and references.</li>
        <li>Projects run on milestones with approval gates and scoped revisions.</li>
        <li>Payments are held until delivery and released instantly on approval.</li>
      </ol>
    </main>
  );
}


