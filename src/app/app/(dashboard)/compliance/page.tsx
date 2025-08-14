export const dynamic = "force-dynamic";
export default function CompliancePage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold">Compliance</h1>
      <div className="rounded-2xl border border-[color:var(--color-border)] p-5 bg-[color:var(--grey-900)]">
        <div className="font-medium">Freelancer Permit</div>
        <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">90 days left</div>
        <div className="mt-4 h-2 bg-[color:var(--grey-800)] rounded-full overflow-hidden">
          <div className="h-full bg-brand-gradient w-2/3" />
        </div>
      </div>
    </div>
  );
}


