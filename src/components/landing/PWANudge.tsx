'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/IconButton';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWANudge - Non-blocking PWA install prompt for mobile
 */
export function PWANudge() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showNudge, setShowNudge] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // Check if already dismissed
    const isDismissed = localStorage.getItem('pwa-nudge-dismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallEvent);
      
      // Only show on mobile and if not already installed
      const isMobile = window.innerWidth <= 768;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      if (isMobile && !isStandalone) {
        // Show after a short delay
        setTimeout(() => {
          setShowNudge(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowNudge(false);
  };

  const handleDismiss = () => {
    setShowNudge(false);
    setDismissed(true);
    localStorage.setItem('pwa-nudge-dismissed', 'true');
  };

  if (!showNudge || dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div 
        className={cn(
          'bg-surface/90 backdrop-blur-glass border border-border rounded-card p-4',
          'shadow-card animate-slide-up'
        )}
      >
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-body font-medium text-text mb-1">
              Add Creator Hive to Home Screen
            </h3>
            <p className="text-label text-muted">
              Install our app for quick access and a native experience.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-accent text-white text-label font-medium rounded-button hover:bg-accent/90 transition-colors duration-150"
            >
              Install
            </button>
            
            <IconButton
              variant="ghost"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              onClick={handleDismiss}
              aria-label="Dismiss"
            />
          </div>
        </div>
      </div>
    </div>
  );
}