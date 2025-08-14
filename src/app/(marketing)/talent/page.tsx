import { talentList } from "@/lib/talent";
import { Card, CardContent } from "@/components/ui/card";

export default function TalentDirectory() {
  return (
    <main className="container py-16">
      <h1 className="text-3xl font-bold">Talent Directory</h1>
      <p className="mt-2 text-[color:var(--color-muted-foreground)]">Discover → Book → Execute → Track.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {talentList.map((t) => (
          <Card key={t.id}>
            <CardContent>
              <div className="font-medium">{t.name}</div>
              <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{t.role} · {t.location}</div>
              <div className="mt-3 text-sm">{t.rate}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}


