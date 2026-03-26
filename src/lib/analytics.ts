/**
 * Creator Hive — client-side analytics event helpers.
 * All events go to PostHog via posthog-js.
 * Safe to call even if PostHog is not initialised (no-ops gracefully).
 */

// Lazy import so we never import posthog-js on the server
async function ph() {
  if (typeof window === "undefined") return null;
  try {
    const { default: posthog } = await import("posthog-js");
    return posthog;
  } catch {
    return null;
  }
}

type Props = Record<string, string | number | boolean | null | undefined>;

async function capture(event: string, props?: Props) {
  const client = await ph();
  client?.capture(event, props);
}

// ── Page / session ──────────────────────────────────────────────────────────
export const analytics = {
  // Landing page
  heroView:              ()               => capture("hero_view"),
  heroEmailFocus:        ()               => capture("hero_email_focus"),
  heroEmailSubmitted:    (mode: string)   => capture("hero_email_submitted",     { mode }),
  heroOtpSent:           (mode: string)   => capture("hero_otp_sent",            { mode }),
  heroOtpVerified:       (mode: string)   => capture("hero_otp_verified",        { mode }),
  heroGoogleClicked:     (mode: string)   => capture("hero_google_clicked",      { mode }),

  // Signup funnel
  signupStarted:         (mode: string)   => capture("signup_started",           { mode }),
  signupStepCompleted:   (step: string)   => capture("signup_step_completed",    { step }),
  signupCompleted:       (mode: string, role?: string) =>
                                            capture("signup_completed",          { mode, role }),
  signupAbandoned:       (step: string)   => capture("signup_abandoned",         { step }),

  // Talent Prism quiz
  prismStarted:          ()               => capture("prism_started"),
  prismCompleted:        (archetype: string) => capture("prism_completed",       { archetype }),

  // Login
  loginStarted:          (method: string) => capture("login_started",            { method }),
  loginCompleted:        (method: string) => capture("login_completed",          { method }),

  // Discovery
  discoveryStarted:      ()               => capture("discovery_started"),
  discoveryStepCompleted:(step: number)   => capture("discovery_step_completed", { step }),
  discoveryCompleted:    ()               => capture("discovery_completed"),
  discoveryAbandoned:    (step: number)   => capture("discovery_abandoned",      { step }),

  // Talent search / gallery
  galleryOpened:         ()               => capture("gallery_opened"),
  searchExecuted:        (query: string, resultCount: number) =>
                                            capture("search_executed",           { query, resultCount }),
  aiSearchExecuted:      (query: string)  => capture("ai_search_executed",       { query }),
  talentViewed:          (talentId: string) => capture("talent_viewed",          { talentId }),
  talentAddedToPod:      (talentId: string) => capture("talent_added_to_pod",    { talentId }),

  // Booking
  bookingStarted:        ()               => capture("booking_started"),
  bookingSubmitted:      (talentCount: number, budget?: string) =>
                                            capture("booking_submitted",         { talentCount, budget }),
  bookingConfirmed:      ()               => capture("booking_confirmed"),

  // Campaign
  campaignCreated:       ()               => capture("campaign_created"),
  campaignPaused:        ()               => capture("campaign_paused"),
  campaignCompleted:     ()               => capture("campaign_completed"),

  // Pay
  payModalOpened:        ()               => capture("pay_modal_opened"),
  payMethodSelected:     (method: string) => capture("pay_method_selected",      { method }),

  // Admin
  adminAction:           (action: string, entityId?: string) =>
                                            capture("admin_action",              { action, entityId }),
};
