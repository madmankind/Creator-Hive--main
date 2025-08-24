'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Wallet, MessageSquare, User } from 'lucide-react';

const tabs = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-border">
      <div className="flex justify-around items-center px-2 pb-safe-area-inset-bottom">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1',
                'transition-colors duration-200 rounded-lg',
                'focus-ring',
                isActive
                  ? 'text-accent'
                  : 'text-muted hover:text-text'
              )}
              style={{ minHeight: '44px' }} // Ensure 44px tap target
            >
              <Icon 
                className={cn(
                  'h-5 w-5 mb-1',
                  isActive && 'drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                )} 
              />
              <span className="text-xs font-medium leading-none">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}