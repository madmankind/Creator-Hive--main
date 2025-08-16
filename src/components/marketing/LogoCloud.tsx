export function LogoCloud() {
  const logos = ["Brand A", "Agency X", "Studio Y", "Corp Z", "Team W"];
  return (
    <section className="container py-16 border-b border-[color:var(--color-border)]">
      <div className="text-center text-sm text-[color:var(--color-muted-foreground)] mb-8">
        Trusted by teams building at speed
      </div>
      <div className="grid grid-cols-5 gap-8 items-center opacity-60">
        {logos.map((name) => (
          <div key={name} className="text-center text-sm font-medium">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
