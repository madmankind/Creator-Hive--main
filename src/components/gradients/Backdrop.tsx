'use client';

import { cn } from '@/lib/utils';

interface BackdropProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Intensity of the gradient effect
   */
  intensity?: 'subtle' | 'normal' | 'vibrant';
  /**
   * Whether to include the vignette border effect
   */
  vignette?: boolean;
  /**
   * Custom z-index value
   */
  zIndex?: number;
}

/**
 * Backdrop - Full-viewport gradient canvas
 * 
 * Creates the signature Fey-inspired gradient backdrop with soft neon gradients
 * over dark slate. Designed to be used as a background layer behind content.
 */
export function Backdrop({ 
  className, 
  intensity = 'normal',
  vignette = true,
  zIndex = -1,
}: BackdropProps) {
  const getIntensityStyles = () => {
    switch (intensity) {
      case 'subtle':
        return {
          background: [
            'radial-gradient(60% 50% at 50% 20%, rgba(139,92,246,0.15), transparent 60%)',
            'radial-gradient(40% 35% at 80% 10%, rgba(6,182,212,0.15), transparent 60%)',
            'radial-gradient(30% 25% at 20% 80%, rgba(255,255,255,0.03), transparent 60%)',
            'linear-gradient(180deg, #0b0f17 0%, #0b0f17 100%)',
          ].join(', '),
        };
      case 'vibrant':
        return {
          background: [
            'radial-gradient(60% 50% at 50% 20%, rgba(139,92,246,0.35), transparent 60%)',
            'radial-gradient(40% 35% at 80% 10%, rgba(6,182,212,0.35), transparent 60%)',
            'radial-gradient(30% 25% at 20% 80%, rgba(255,255,255,0.08), transparent 60%)',
            'linear-gradient(180deg, #0b0f17 0%, #0b0f17 100%)',
          ].join(', '),
        };
      default:
        return {
          background: [
            'radial-gradient(60% 50% at 50% 20%, rgba(139,92,246,0.25), transparent 60%)',
            'radial-gradient(40% 35% at 80% 10%, rgba(6,182,212,0.25), transparent 60%)',
            'radial-gradient(30% 25% at 20% 80%, rgba(255,255,255,0.05), transparent 60%)',
            'linear-gradient(180deg, #0b0f17 0%, #0b0f17 100%)',
          ].join(', '),
        };
    }
  };

  const vignetteStyles = vignette ? {
    boxShadow: 'inset 0 0 0 1px var(--border)',
  } : {};

  return (
    <div
      className={cn(
        // Base positioning and sizing
        'fixed inset-0 w-full h-full',
        // Mix blend mode for proper layering
        'mix-blend-normal',
        className
      )}
      style={{
        zIndex,
        ...getIntensityStyles(),
        ...vignetteStyles,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * BackdropVariants - Pre-configured backdrop variants
 */
export const BackdropVariants = {
  /**
   * Default backdrop for general use
   */
  Default: () => <Backdrop />,
  
  /**
   * Subtle backdrop for content-heavy pages
   */
  Subtle: () => <Backdrop intensity="subtle" />,
  
  /**
   * Vibrant backdrop for landing/hero sections
   */
  Vibrant: () => <Backdrop intensity="vibrant" />,
  
  /**
   * Clean backdrop without vignette border
   */
  Clean: () => <Backdrop vignette={false} />,
  
  /**
   * Auth backdrop - centered focus effect
   */
  Auth: () => (
    <Backdrop 
      intensity="normal"
      className="bg-center bg-no-repeat"
      style={{
        backgroundSize: '800px 600px',
        backgroundImage: [
          'radial-gradient(400px 300px at 50% 50%, rgba(139,92,246,0.3), transparent 70%)',
          'radial-gradient(300px 200px at 50% 50%, rgba(6,182,212,0.2), transparent 70%)',
          'linear-gradient(180deg, #0b0f17 0%, #0b0f17 100%)',
        ].join(', '),
      }}
    />
  ),
} as const;

export default Backdrop;