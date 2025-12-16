// src/app/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroBar } from "@/components/HeroBar";
import { TalentCarousel } from "@/components/marketing/TalentCarousel";
import { CampaignPodPanel } from "@/components/talent/CampaignPodPanel";
import { BookingModal } from "@/components/booking/BookingModal";
import { ClientAuthDialog } from "@/components/auth/ClientAuthDialog";
import { TalentOnboardingDialog } from "@/components/auth/TalentOnboardingDialog";
import { curatedTalent } from "@/lib/curatedTalent";
import { useCampaignPodStore, type Talent as PodTalent } from "@/store/useCampaignPodStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { CuratedTalent } from "@/lib/curatedTalent";

export default function HomePage() {
  const [mode, setMode] = useState<'client' | 'talent'>('client');
  const [showTalentGallery, setShowTalentGallery] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingTalents, setBookingTalents] = useState<PodTalent[]>([]);
  const [clientAuthOpen, setClientAuthOpen] = useState(false);
  const [talentAuthOpen, setTalentAuthOpen] = useState(false);
  const [pendingDiscover, setPendingDiscover] = useState(false);
  const { selectedTalents } = useCampaignPodStore();
  const { isAuthenticated, userType, setAuthenticated } = useAuthStore();

  return (
    <main className="min-h-screen bg-[#0B0F14] text-slate-200">
      {/* Subtle vertical glow like Fey */}
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center">
        <div className="mt-8 h-[40vh] w-[60vw] max-w-[900px] blur-3xl opacity-[0.16] bg-gradient-to-b from-white/25 via-white/10 to-transparent rounded-full"></div>
      </div>

      {/* Centered content container */}
      <div className="relative flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-[1100px]">
          {/* Header - Perfectly centered */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.02em] text-white/90">
              Welcome to Creator Hive
            </h1>

            {/* Toggle */}
            <div className="inline-flex items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
              <button 
                onClick={() => setMode('client')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition ${
                  mode === 'client' 
                    ? 'bg-white/10 text-white ring-1 ring-white/15' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Client
              </button>
              <button 
                onClick={() => setMode('talent')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition ${
                  mode === 'talent' 
                    ? 'bg-white/10 text-white ring-1 ring-white/15' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Talent
              </button>
            </div>

            <p className="text-[14px] text-white/60">
              {mode === 'client' ? 'Book Top 1% talent seamlessly' : 'Join the Hive to showcase your work and get discovered.'}
            </p>
            {mode === 'client' && (
              <p className="text-[13px] text-white/50 mt-2">
                Describe your campaign and choose the roles you need – we&apos;ll surface curated talent that fits.
              </p>
            )}
          </div>

          {/* Hero Bar - Centered */}
          <div className="flex justify-center">
            <div className="w-full max-w-[860px]">
              <HeroBar
                mode={mode}
                onQueryChange={(q) => setSearchQuery(q)}
                onRolesChange={(roles) => setSelectedRoles(roles)}
                onDiscover={() => {
                  // Check auth for client mode
                  if (mode === 'client' && (!isAuthenticated || userType !== 'client')) {
                    setPendingDiscover(true);
                    setClientAuthOpen(true);
                    return;
                  }
                  // Proceed to gallery
                  setShowTalentGallery(true);
                  setTimeout(() => {
                    document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                onOpenBriefBuilder={() => {
                  // Check auth for brief builder
                  if (mode === 'client' && (!isAuthenticated || userType !== 'client')) {
                    setClientAuthOpen(true);
                    return;
                  }
                  // Open booking modal with empty talents for brief builder
                  setBookingTalents([]);
                  setBookingOpen(true);
                }}
                onTalentApply={async (data) => {
                  // Handle talent application
                  console.log("Talent apply:", data);
                  // Open talent onboarding dialog for Instagram step
                  setTalentAuthOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Talent Gallery Section */}
      {mode === 'client' && showTalentGallery && (
        <section id="talent-gallery" className="mt-20 md:mt-28">
          <TalentCarousel 
            talents={curatedTalent} 
            query={searchQuery} 
            selectedRoles={selectedRoles}
            onTalentClick={(talentId) => {
              // Find the talent and open booking modal
              const talent = curatedTalent.find(t => t.id === talentId);
              if (talent) {
                const podTalent: PodTalent = {
                  id: talent.id,
                  name: talent.name,
                  headline: talent.displayTitle,
                  avatarUrl: talent.avatarUrl,
                  roles: talent.roleTags,
                  platforms: talent.platformTags,
                  availabilityTags: talent.availability,
                  bio: talent.shortBio,
                };
                setBookingTalents([podTalent]);
                setBookingOpen(true);
              }
            }}
          />
        </section>
      )}

      {/* Campaign Pod Panel */}
      {mode === 'client' && (
        <CampaignPodPanel
          onOpenBrief={() => {
            if (selectedTalents.length > 0) {
              setBookingTalents(selectedTalents);
              setBookingOpen(true);
            }
          }}
          onOpenProfile={(talentId) => {
            // Scroll to talent or expand detail view
            const talent = curatedTalent.find(t => t.id === talentId);
            if (talent) {
              document.getElementById(`talent-${talentId}`)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setBookingTalents([]);
        }}
        talents={bookingTalents}
        onViewPod={() => {
          // Scroll to pod panel if it exists
          document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Client Auth Dialog */}
      <ClientAuthDialog
        open={clientAuthOpen}
        onClose={() => {
          setClientAuthOpen(false);
          setPendingDiscover(false);
        }}
        onSuccess={() => {
          // After successful auth, proceed with pending discover if any
          if (pendingDiscover) {
            setShowTalentGallery(true);
            setTimeout(() => {
              document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
            setPendingDiscover(false);
          }
        }}
      />

      {/* Talent Onboarding Dialog */}
      <TalentOnboardingDialog
        open={talentAuthOpen}
        onClose={() => setTalentAuthOpen(false)}
        onSuccess={() => {
          // Talent onboarding complete
        }}
      />

      {/* Footer Disclaimer */}
      <footer className="mt-16 border-t border-white/10 pt-4 pb-6 text-center">
        <p className="text-[11px] text-white/45">
          Creator Hive is human-first. Please clearly label any AI-generated media.
        </p>
      </footer>
    </main>
  );
}
