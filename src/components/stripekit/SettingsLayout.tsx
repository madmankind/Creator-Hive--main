'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  FileText, 
  Banknote, 
  Shield, 
  Users, 
  Key, 
  Webhook, 
  Menu,
  X
} from 'lucide-react';

const navigation = [
  {
    name: 'Payment Methods',
    href: '/settings/payment-methods',
    icon: CreditCard,
    description: 'Cards and bank accounts'
  },
  {
    name: 'Invoices',
    href: '/settings/invoices',
    icon: FileText,
    description: 'Create and manage invoices'
  },
  {
    name: 'Payouts',
    href: '/settings/payouts',
    icon: Banknote,
    description: 'Bank transfers and scheduling'
  },
  {
    name: 'Tax & KYC',
    href: '/settings/tax-kyc',
    icon: Shield,
    description: 'Tax info and identity verification'
  },
  {
    name: 'Clients',
    href: '/settings/clients',
    icon: Users,
    description: 'Manage client information'
  },
  {
    name: 'API Keys',
    href: '/settings/api-keys',
    icon: Key,
    description: 'Manage API access'
  },
  {
    name: 'Webhooks',
    href: '/settings/webhooks',
    icon: Webhook,
    description: 'Configure webhook endpoints'
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-80 transform bg-surface border-r border-border transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link href="/home" className="text-lg font-semibold text-text">
              Settings
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-muted hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                    'hover:bg-surface-2 focus-ring',
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-muted hover:text-text'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Mobile header */}
        <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-surface border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-muted hover:text-text"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/home" className="text-lg font-semibold text-text">
            Settings
          </Link>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
          {title && (
            <div className="mb-8">
              <h1 className="h1">{title}</h1>
              {description && (
                <p className="body text-muted mt-2">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}