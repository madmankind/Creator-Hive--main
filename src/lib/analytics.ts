/**
 * Analytics event tracking for Creator Hive
 * 
 * PostHog is our primary analytics tool. This module provides
 * a clean interface for tracking user actions across the app.
 * 
 * Usage:
 * import { analytics } from '@/lib/analytics'
 * analytics.authStarted('email_otp')
 */

import posthog from 'posthog-js';

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties || {});
  }
}

// Authentication events
export const authEvents = {
  started: (method: 'email_otp' | 'google' | 'credentials') => 
    trackEvent('auth_started', { method }),
  
  completed: (role: 'CREATOR' | 'AGENCY') => 
    trackEvent('auth_completed', { role }),
  
  failed: (reason: string) => 
    trackEvent('auth_failed', { reason }),
  
  otpSent: (destination: string) => 
    trackEvent('otp_sent', { destination }),
  
  otpVerified: () => 
    trackEvent('otp_verified'),
};

// Form interaction events
export const formEvents = {
  started: (formName: string) => 
    trackEvent('form_started', { form: formName }),
  
  fieldFilled: (formName: string, fieldName: string) => 
    trackEvent('form_field_filled', { form: formName, field: fieldName }),
  
  fieldError: (formName: string, fieldName: string, error: string) => 
    trackEvent('form_field_error', { form: formName, field: fieldName, error }),
  
  submitted: (formName: string, fieldCount: number) => 
    trackEvent('form_submitted', { form: formName, field_count: fieldCount }),
  
  abandoned: (formName: string, lastField: string, secondsSpent: number) => 
    trackEvent('form_abandoned', { 
      form: formName, 
      last_field: lastField,
      seconds_spent: secondsSpent 
    }),
};

// CTA (Call to Action) events
export const ctaEvents = {
  clicked: (ctaName: string, location?: string) => 
    trackEvent('cta_clicked', { cta: ctaName, location }),
  
  hovered: (ctaName: string) => 
    trackEvent('cta_hovered', { cta: ctaName }),
  
  heroEmailSubmitted: (mode: 'brand' | 'creator') => 
    trackEvent('hero_email_submitted', { mode }),
  
  heroGoogleClicked: (mode: 'client' | 'talent') =>
    trackEvent('hero_google_clicked', { mode }),
};

// Page interaction events
export const pageEvents = {
  scrollDepth: (percentage: number) => 
    trackEvent('scroll_depth', { depth: percentage }),
  
  videoPlayed: (videoName: string) => 
    trackEvent('video_played', { video: videoName }),
  
  videoCompleted: (videoName: string, secondsWatched: number) => 
    trackEvent('video_completed', { video: videoName, seconds: secondsWatched }),
  
  linkClicked: (linkName: string, url: string) => 
    trackEvent('link_clicked', { link: linkName, url }),
  
  imageViewed: (imageName: string) => 
    trackEvent('image_viewed', { image: imageName }),
};

// Campaign & marketing events
export const campaignEvents = {
  viewed: (campaignId: string) => 
    trackEvent('campaign_viewed', { campaign_id: campaignId }),
  
  booked: (campaignId: string, talentCount: number, budget: number) => 
    trackEvent('campaign_booked', { 
      campaign_id: campaignId, 
      talent_count: talentCount,
      budget,
    }),
  
  briefCreated: (campaignId: string, roleCount: number) => 
    trackEvent('campaign_brief_created', { 
      campaign_id: campaignId, 
      role_count: roleCount,
    }),
};

// Talent profile events
export const talentEvents = {
  profileViewed: (talentId: string) => 
    trackEvent('talent_profile_viewed', { talent_id: talentId }),
  
  favorited: (talentId: string) => 
    trackEvent('talent_favorited', { talent_id: talentId }),
  
  inquired: (talentId: string) => 
    trackEvent('talent_inquired', { talent_id: talentId }),
};

// Search & discovery events
export const searchEvents = {
  performed: (query: string, resultCount: number) => 
    trackEvent('search_performed', { query, result_count: resultCount }),
  
  resultClicked: (query: string, resultIndex: number) => 
    trackEvent('search_result_clicked', { query, result_index: resultIndex }),
  
  filterApplied: (filterName: string, filterValue: string) => 
    trackEvent('search_filter_applied', { filter: filterName, value: filterValue }),
};

// Error & support events
export const errorEvents = {
  jsError: (errorMessage: string, errorStack?: string) => 
    trackEvent('js_error', { message: errorMessage, stack: errorStack }),
  
  apiError: (endpoint: string, status: number, error: string) => 
    trackEvent('api_error', { endpoint, status, error }),
  
  supportRequested: (topic: string) => 
    trackEvent('support_requested', { topic }),
};

// Auth flow breakdown events
export const authFlowEvents = {
  signupStarted: (mode: 'client' | 'talent') =>
    trackEvent('signup_started', { mode }),
  
  signupStepCompleted: (step: string) =>
    trackEvent('signup_step_completed', { step }),
  
  loginStarted: (method: string) =>
    trackEvent('login_started', { method }),
  
  loginCompleted: (method: string) =>
    trackEvent('login_completed', { method }),
  
  heroOtpVerified: (mode: 'client' | 'talent') =>
    trackEvent('hero_otp_verified', { mode }),
};

// Convenience object to import everything
export const analytics = {
  auth: authEvents,
  form: formEvents,
  cta: ctaEvents,
  page: pageEvents,
  campaign: campaignEvents,
  talent: talentEvents,
  search: searchEvents,
  error: errorEvents,
  authFlow: authFlowEvents,
  // Direct method shortcuts (for calls like analytics.signupStarted)
  signupStarted: (mode: 'client' | 'talent') => authFlowEvents.signupStarted(mode),
  signupStepCompleted: (step: string) => authFlowEvents.signupStepCompleted(step),
  loginStarted: (method: string) => authFlowEvents.loginStarted(method),
  loginCompleted: (method: string) => authFlowEvents.loginCompleted(method),
  heroOtpVerified: (mode: 'client' | 'talent') => authFlowEvents.heroOtpVerified(mode),
  heroGoogleClicked: (mode: 'client' | 'talent') => ctaEvents.heroGoogleClicked(mode),
  heroEmailSubmitted: (mode: 'brand' | 'creator') => ctaEvents.heroEmailSubmitted(mode),
};
