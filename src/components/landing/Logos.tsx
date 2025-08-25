'use client';

import * as React from 'react';

/**
 * Logo placeholder component
 */
function LogoPlaceholder({ name, width = 120 }: { name: string; width?: number }) {
  return (
    <div 
      className="flex items-center justify-center bg-surface/30 rounded-lg border border-border h-12 opacity-60 hover:opacity-80 transition-opacity duration-150"
      style={{ width: `${width}px` }}
    >
      <span className="text-label text-muted font-medium">
        {name}
      </span>
    </div>
  );
}

/**
 * Logos - Social proof section with placeholder logos
 */
export function Logos() {
  const logos = [
    { name: "Adobe", width: 100 },
    { name: "Spotify", width: 110 },
    { name: "Netflix", width: 100 },
    { name: "YouTube", width: 120 },
    { name: "TikTok", width: 90 },
    { name: "Twitch", width: 100 }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-label text-muted font-medium mb-8">
            Trusted by creators working with
          </p>
        </div>

        {/* Logos Grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, index) => (
            <LogoPlaceholder
              key={index}
              name={logo.name}
              width={logo.width}
            />
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-h1 font-bold text-text">
              10,000+
            </div>
            <p className="text-body text-muted">
              Active creators
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-h1 font-bold text-text">
              $50M+
            </div>
            <p className="text-body text-muted">
              Payments processed
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-h1 font-bold text-text">
              150+
            </div>
            <p className="text-body text-muted">
              Countries supported
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}