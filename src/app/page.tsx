// src/app/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import { TalentCarousel } from "@/components/marketing/TalentCarousel";
import { curatedTalent } from "@/lib/curatedTalent";

export default function HomePage() {
  const [mode, setMode] = useState<'client' | 'talent'>('client');
  const [showTalentGallery, setShowTalentGallery] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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

          {/* Search/Auth Bar - Centered */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              {mode === 'client' ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="w-full max-w-[860px]"
                >
                  <SearchBar
                    onResults={(data) => {
                      // TEMP
                      console.log("AI Search Results:", data);
                    }}
                    onQueryChange={(q) => setSearchQuery(q)}
                    onRolesChange={(roles) => setSelectedRoles(roles)}
                    onDiscover={() => {
                      setShowTalentGallery(true);
                      setTimeout(() => {
                        document.getElementById("talent-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="w-full max-w-[860px]"
                >
                  <div className="mx-auto max-w-[860px]">
                    <div className="rounded-full bg-white/5 ring-1 ring-white/10 p-2 pl-5 pr-3 flex items-center gap-3">
                      <input
                        type="email"
                        placeholder="Work email"
                        className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-400/40 text-[15px] leading-8"
                      />
                      <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-2">
                        <span className="text-xs text-white/50">WhatsApp</span>
                        <input
                          type="tel"
                          placeholder="+971 xx xxx xxxx"
                          className="w-[160px] bg-transparent outline-none text-slate-200 placeholder:text-slate-400/40 text-[13px]"
                        />
                        <button className="rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15">
                          Send OTP
                        </button>
                      </div>
                      <button aria-label="Sign up with Google" className="rounded-full bg-white/7 ring-1 ring-white/10 px-3 py-1.5">
                        <img src="/google.svg" alt="Google" className="h-5 w-5" />
                      </button>
                      <button aria-label="Sign up with Apple" className="rounded-full bg-white/7 ring-1 ring-white/10 px-3 py-1.5">
                        <img src="/apple.svg" alt="Apple" className="h-5 w-5" />
                      </button>
                      <button
                        onClick={()=>window.location.href='/discovery'}
                        className="rounded-full bg-white/10 border border-white/10 px-4 h-10 text-[14px] text-slate-200 hover:bg-white/15"
                      >
                        Explore Discovery
                      </button>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-[12px] text-white/50">
                      Independent creators sign up to showcase their work. Talent managers sign up to manage multiple creators under one dashboard.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
          />
        </section>
      )}
    </main>
  );
}
