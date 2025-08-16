import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  const links = [
    { href: "/", label: "Product" },
    { href: "/pricing", label: "Pricing" },
    { href: "/for-creators", label: "For Creators" },
    { href: "/for-brands", label: "For Brands" },
    { href: "/docs", label: "Docs" },
    { href: "/talent", label: "Talent" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" }
  ];

  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--grey-900)]">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo height={24} />
            <span className="text-sm text-[color:var(--color-muted-foreground)]">
              © Creator Hive
            </span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-[color:var(--color-muted-foreground)]">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[color:var(--text)] transition">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
