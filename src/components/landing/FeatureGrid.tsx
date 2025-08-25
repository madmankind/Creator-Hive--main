'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card 
      variant="glass" 
      padding="md" 
      hoverable
      className="h-full"
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className="w-5 h-5 text-accent flex-shrink-0">
          {icon}
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-h2 font-semibold text-text">
            {title}
          </h3>
          <p className="text-body text-muted leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * FeatureGrid - Three key features in responsive grid
 */
export function FeatureGrid() {
  const features: FeatureCardProps[] = [
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Fast payouts & wallet",
      description: "Get paid instantly with our global payment network. Hold multiple currencies and transfer funds with zero fees."
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Invoices, tax & KYC",
      description: "Professional invoicing with automatic tax calculations. Stay compliant with built-in KYC and tax reporting tools."
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Messaging & jobs",
      description: "Connect with brands and talent through our integrated messaging platform. Post jobs and manage collaborations seamlessly."
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-h1 font-bold text-text">
            Everything creators need
          </h2>
          <p className="text-body text-muted max-w-2xl mx-auto">
            From payments to project management, we've built the complete toolkit for modern creators and their businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}