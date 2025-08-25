'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface StepProps {
  number: number;
  title: string;
  description: string;
  image?: string;
}

function Step({ number, title, description, image }: StepProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
      {/* Step Number */}
      <div className="flex-shrink-0">
        <Badge 
          variant="accent" 
          size="lg"
          className="w-12 h-12 rounded-full flex items-center justify-center text-h2 font-bold"
        >
          {number}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <h3 className="text-h2 font-semibold text-text">
            {title}
          </h3>
          <p className="text-body text-muted leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Placeholder Image */}
        <div className="w-full h-48 bg-surface/30 rounded-card border border-border flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-surface rounded-lg mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-label text-muted">Step {number} Illustration</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HowItWorks - Three-step process explanation
 */
export function HowItWorks() {
  const steps: StepProps[] = [
    {
      number: 1,
      title: "Describe your project — AI drafts your job",
      description: "Tell us what you need in plain language. Our AI will create a detailed job posting with requirements, timeline, and budget suggestions based on market data."
    },
    {
      number: 2,
      title: "Choose how to find talent — public or private",
      description: "Post publicly to our talent marketplace or invite specific creators privately. Set your own terms and review applications with built-in portfolio screening."
    },
    {
      number: 3,
      title: "Hire, invoice, and pay — all in one place",
      description: "Onboard talent with digital contracts, track project milestones, generate professional invoices, and process payments instantly with our global network."
    }
  ];

  return (
    <section className="py-20 px-4 bg-surface/20">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-h1 font-bold text-text">
            How it works
          </h2>
          <p className="text-body text-muted max-w-2xl mx-auto">
            From concept to completion in three simple steps. We handle the complexity so you can focus on creating.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index}>
              <Step {...step} />
              
              {/* Connector Line (except for last step) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-12">
                  <div className="w-px h-12 bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-body text-muted mb-6">
            Ready to streamline your creator business?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.href = '/signup'}
              className="px-6 py-3 bg-accent text-white rounded-button font-medium hover:bg-accent/90 transition-colors duration-150"
            >
              Start your free trial
            </button>
            <button className="text-accent hover:text-accent/80 transition-colors duration-150">
              Schedule a demo →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}