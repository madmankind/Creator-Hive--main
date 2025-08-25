import { Backdrop } from '@/components/gradients/Backdrop';
import { TopNav, TopNavVariants } from '@/components/nav/TopNav';
import { cn } from '@/lib/utils';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Public Layout - For marketing and landing pages
 * Uses Backdrop gradient + TopNav with glass effect
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen bg-bg">
      {/* Gradient Backdrop */}
      <Backdrop intensity="normal" />
      
      {/* Navigation */}
      <TopNavVariants.Marketing
        brand={
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CH</span>
            </div>
            <span className="text-h2 font-bold text-text">Creator Hive</span>
          </div>
        }
        navItems={[
          { label: 'For Creators', href: '/for-creators' },
          { label: 'For Brands', href: '/for-brands' },
          { label: 'Talent', href: '/talent' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Docs', href: '/docs' },
        ]}
        showAuth={true}
        onSignIn={() => {
          // Handle sign in
          window.location.href = '/auth/signin';
        }}
        onSignUp={() => {
          // Handle sign up
          window.location.href = '/auth/signup';
        }}
      />
      
      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Footer spacer for mobile tab bar if needed */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}