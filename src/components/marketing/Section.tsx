import { ReactNode } from "react";

export function Section({ children, gradient = false, id }: { children: ReactNode; gradient?: boolean; id?: string }) {
  return (
    <section id={id} className={gradient ? "relative" : undefined}>
      {gradient && (
        <div aria-hidden className="pointer-events-none absolute inset-0 grain">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(800px_400px_at_20%_10%,rgba(102,123,255,0.12),transparent),radial-gradient(600px_300px_at_80%_0%,rgba(181,182,243,0.12),transparent)]" />
        </div>
      )}
      <div className="container py-16 md:py-24 relative">{children}</div>
    </section>
  );
}


