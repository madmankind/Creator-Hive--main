import { BackdropVariants } from '@/components/gradients/Backdrop';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth Layout - For authentication pages
 * Uses centered gradient focus effect for forms
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-bg">
      {/* Auth-specific Backdrop with centered focus */}
      <BackdropVariants.Auth />
      
      {/* Minimal header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          <span className="text-h2 font-bold text-text">Creator Hive</span>
        </div>
        
        {/* Back to home link */}
        <Link
          href="/"
          className={cn(
            'text-muted hover:text-text transition-colors duration-150',
            'text-body font-medium'
          )}
        >
          ← Back to Home
        </Link>
      </header>
      
      {/* Centered Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}