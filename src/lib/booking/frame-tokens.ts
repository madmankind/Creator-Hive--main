/**
 * UNIFIED FRAME TOKENS
 * Single source of truth for card/wizard frame sizing across talent carousel + brief wizard
 * NO component may change these dimensions across steps
 */

export const FRAME_TOKENS = {
  // Card dimensions (matches locked talent card height from restore/landing-carousel-locked)
  CARD_WIDTH_DESKTOP: 420,
  CARD_WIDTH_MOBILE_VW: 92, // 92vw on mobile
  CARD_HEIGHT: 285, // Matches LandingTalentCard h-[285px]
  
  // Card styling (from LandingTalentCard)
  CARD_RADIUS: "1rem", // rounded-2xl
  CARD_BG: "rgba(255, 255, 255, 0.05)", // bg-white/5
  CARD_RING: "1px solid rgba(255, 255, 255, 0.1)", // ring-1 ring-white/10
  CARD_SHADOW: "0 10px 25px rgba(0, 0, 0, 0.3)",
  CARD_PADDING: "1.5rem", // p-6
  
  // Hover states
  CARD_HOVER_RING: "rgba(255, 255, 255, 0.2)",
  CARD_HOVER_SHADOW: "0 10px 25px rgba(255, 255, 255, 0.05)",
} as const;

/**
 * CSS class string for frame container
 * Use this for both talent cards and brief wizard to maintain consistency
 */
export function getFrameClasses() {
  return `
    w-[${FRAME_TOKENS.CARD_WIDTH_DESKTOP}px] 
    max-w-[${FRAME_TOKENS.CARD_WIDTH_MOBILE_VW}vw] 
    h-[${FRAME_TOKENS.CARD_HEIGHT}px]
    rounded-2xl 
    bg-white/5 
    ring-1 ring-white/10 
    shadow-xl
    p-6
    transition-all duration-300
    hover:ring-white/20 hover:shadow-lg hover:shadow-white/5
  `.trim().replace(/\s+/g, " ");
}

/**
 * Inline styles for frame container (for strict sizing enforcement)
 */
export function getFrameStyles(): React.CSSProperties {
  return {
    width: FRAME_TOKENS.CARD_WIDTH_DESKTOP,
    maxWidth: `${FRAME_TOKENS.CARD_WIDTH_MOBILE_VW}vw`,
    height: FRAME_TOKENS.CARD_HEIGHT,
    borderRadius: FRAME_TOKENS.CARD_RADIUS,
    background: FRAME_TOKENS.CARD_BG,
    border: FRAME_TOKENS.CARD_RING,
    boxShadow: FRAME_TOKENS.CARD_SHADOW,
    padding: FRAME_TOKENS.CARD_PADDING,
  };
}
