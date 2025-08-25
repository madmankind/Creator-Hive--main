'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

/**
 * Hero - Fey-style hero section with command bar and gradient text
 */
export function Hero() {
  const [commandFocused, setCommandFocused] = React.useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-[560px] text-center space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-display font-extrabold text-text leading-none">
            Payments & Ops for{' '}
            <span 
              className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)'
              }}
            >
              Creators
            </span>
            .
          </h1>
          
          {/* Subtitle */}
          <p className="text-body text-muted max-w-[560px] mx-auto leading-relaxed">
            The all-in-one platform for creator payments, invoicing, and talent management.
            <br />
            Built for the next generation of digital entrepreneurs.
          </p>
        </div>

        {/* Command Bar */}
        <div className="relative">
          {/* Glow Card Background */}
          <div 
            className={cn(
              'absolute inset-0 rounded-[14px] transition-all duration-200',
              'bg-surface/40 backdrop-blur-glass border border-border',
              commandFocused && 'shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] scale-[1.02]'
            )}
            style={{
              background: commandFocused 
                ? 'rgba(17, 24, 39, 0.6)' 
                : 'rgba(17, 24, 39, 0.4)'
            }}
          />
          
          {/* Command Input */}
          <div 
            className="relative flex items-center h-12 px-4"
            style={{ width: 'min(92vw, 560px)' }}
          >
            {/* Search Icon */}
            <svg 
              className="w-5 h-5 text-muted mr-3 flex-shrink-0"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
              />
            </svg>
            
            {/* Input */}
            <input
              type="text"
              placeholder="Search creators, invoices, or actions…"
              className={cn(
                'flex-1 bg-transparent border-none outline-none',
                'text-body text-text placeholder:text-muted',
                'focus:outline-none'
              )}
              onFocus={() => setCommandFocused(true)}
              onBlur={() => setCommandFocused(false)}
              style={{
                outline: commandFocused 
                  ? '2px solid color-mix(in oklab, var(--accent), white 20%)' 
                  : 'none',
                outlineOffset: '2px'
              }}
            />
            
            {/* Shortcut Hint */}
            <div className="hidden sm:flex items-center space-x-1 text-muted text-xs">
              <kbd className="px-2 py-1 bg-surface/50 rounded text-xs border border-border">
                ⌘
              </kbd>
              <kbd className="px-2 py-1 bg-surface/50 rounded text-xs border border-border">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="primary" 
            size="md"
            className="w-full sm:w-auto"
            onClick={() => window.location.href = '/signup'}
          >
            Get started
          </Button>
          
          <Button 
            variant="ghost" 
            size="md"
            className="w-full sm:w-auto"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            }
            iconPosition="left"
          >
            Watch 60-second intro
          </Button>
        </div>

        {/* Social Proof Hint */}
        <p className="text-label text-muted">
          Trusted by 10,000+ creators worldwide
        </p>
      </div>
    </section>
  );
}