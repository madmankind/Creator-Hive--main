'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Bell, User } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/home' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Wallet', href: '/wallet' },
  { name: 'Messages', href: '/messages' },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-7xl px-6">
        <nav className="flex h-16 items-center justify-between backdrop-blur-xl bg-surface/80 border-b border-border rounded-none">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/home" className="text-xl font-semibold text-text">
              Creator Hive
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    'hover:text-text focus-ring rounded-md px-3 py-2',
                    isActive
                      ? 'text-text bg-surface-2'
                      : 'text-muted hover:text-text'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-muted hover:text-text transition-colors focus-ring rounded-md">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-muted hover:text-text transition-colors focus-ring rounded-md">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 text-muted hover:text-text transition-colors focus-ring rounded-md">
              <User className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>
      {/* Neon hairline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </header>
  );
}