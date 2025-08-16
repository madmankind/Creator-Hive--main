import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export function CTA() {
  return (
    <section className="container py-24">
      <div className="text-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--grey-900)] p-12">
        <h2 className="text-3xl font-bold">Ready to build?</h2>
        <p className="mt-4 text-lg text-[color:var(--color-muted-foreground)]">
          Brief today. Meet your shortlist this week.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/signup" className={buttonVariants({ variant: "gradient" })}>
            Get Started
          </Link>
          <Link href="/docs#contact" className={buttonVariants({ variant: "outline" })}>
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
