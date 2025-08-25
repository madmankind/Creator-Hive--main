'use client';

import * as React from 'react';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <a 
      href={href}
      className="text-muted hover:text-text transition-colors duration-150 text-body"
    >
      {children}
    </a>
  );
}

interface FooterColumnProps {
  title: string;
  links: Array<{ href: string; label: string }>;
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-body font-semibold text-text">
        {title}
      </h3>
      <nav className="space-y-3">
        {links.map((link, index) => (
          <div key={index}>
            <FooterLink href={link.href}>
              {link.label}
            </FooterLink>
          </div>
        ))}
      </nav>
    </div>
  );
}

/**
 * Footer - Minimal footer with organized links
 */
export function Footer() {
  const footerColumns: FooterColumnProps[] = [
    {
      title: "Product",
      links: [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/integrations", label: "Integrations" },
        { href: "/api", label: "API" },
        { href: "/changelog", label: "Changelog" }
      ]
    },
    {
      title: "For Creators",
      links: [
        { href: "/for-creators", label: "Overview" },
        { href: "/creators/payments", label: "Payments" },
        { href: "/creators/invoicing", label: "Invoicing" },
        { href: "/creators/portfolio", label: "Portfolio" },
        { href: "/creators/analytics", label: "Analytics" }
      ]
    },
    {
      title: "For Brands",
      links: [
        { href: "/for-brands", label: "Overview" },
        { href: "/brands/talent", label: "Find Talent" },
        { href: "/brands/campaigns", label: "Campaigns" },
        { href: "/brands/reporting", label: "Reporting" },
        { href: "/brands/enterprise", label: "Enterprise" }
      ]
    },
    {
      title: "Resources",
      links: [
        { href: "/docs", label: "Documentation" },
        { href: "/guides", label: "Guides" },
        { href: "/blog", label: "Blog" },
        { href: "/support", label: "Support" },
        { href: "/status", label: "Status" }
      ]
    }
  ];

  return (
    <footer className="border-t border-border bg-surface/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerColumns.map((column, index) => (
            <FooterColumn
              key={index}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">CH</span>
              </div>
              <span className="text-body font-semibold text-text">Creator Hive</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-label text-muted">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center md:text-left">
            <p className="text-label text-muted">
              © {new Date().getFullYear()} Creator Hive. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}