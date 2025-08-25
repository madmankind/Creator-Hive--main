'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * CTA - Call-to-action band with gradient background
 */
export function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Card 
          variant="glass" 
          padding="lg"
          className="text-center relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at center, var(--accent) 0%, var(--accent-2) 70%, transparent 100%)'
            }}
          />
          
          {/* Content */}
          <div className="relative space-y-8">
            <div className="space-y-4">
              <h2 className="text-h1 font-bold text-text">
                Spin up your workspace in minutes.
              </h2>
              <p className="text-body text-muted max-w-2xl mx-auto">
                Join thousands of creators who have already streamlined their business operations with Creator Hive.
                No setup fees, no long-term contracts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="primary" 
                size="md"
                className="w-full sm:w-auto"
                onClick={() => window.location.href = '/signup'}
              >
                Sign up free
              </Button>
              
              <Button 
                variant="ghost" 
                size="md"
                className="w-full sm:w-auto"
                onClick={() => window.location.href = '/signin'}
              >
                Sign in
              </Button>
            </div>

            {/* Additional Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-label text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Free 14-day trial</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}