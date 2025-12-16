'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Mock data for demo
const mockCampaigns = [
  {
    id: '1',
    title: 'Summer Product Launch',
    brief: 'Need content creators for our new summer collection launch',
    status: 'ACTIVE',
    talents: [
      { talentId: '1', talent: { name: 'Sarah Chen' } },
      { talentId: '2', talent: { name: 'Marcus Johnson' } }
    ]
  },
  {
    id: '2',
    title: 'Brand Awareness Campaign',
    brief: 'Looking for UGC creators to showcase our products',
    status: 'DRAFT',
    talents: [
      { talentId: '3', talent: { name: 'Emma Rodriguez' } }
    ]
  },
  {
    id: '3',
    title: 'Holiday Video Series',
    brief: 'Creating a series of holiday-themed videos',
    status: 'COMPLETED',
    talents: [
      { talentId: '1', talent: { name: 'Sarah Chen' } },
      { talentId: '3', talent: { name: 'Emma Rodriguez' } }
    ]
  }
]

export default function Overview() {
  const { activeTalentId } = useAgencyFilter()
  const [campaigns] = useState(mockCampaigns) // In production: useSWR('/api/agency/campaigns', fetcher)

  const filteredCampaigns = campaigns.filter((c)=>{
    if (!activeTalentId) return true
    return c.talents?.some((x)=>x.talentId===activeTalentId)
  })

  const activeCount = filteredCampaigns.filter(c => c.status === 'ACTIVE').length

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-6 pt-6 pb-10">
      {/* Left column */}
      <section className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-slate-100">Overview</h1>
            <p className="text-sm text-slate-400 mt-0.5">Your dashboard at a glance</p>
          </div>
          <Link 
            href="/dashboard/campaigns"
            className="rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-white/90 transition"
          >
            + New Campaign
          </Link>
        </div>

        {/* Metric cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Total revenue</div>
            <div className="text-lg font-semibold text-slate-100">$24,500</div>
            <div className="text-[11px] text-slate-400 mt-1">+12% from last month</div>
          </div>
          <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Pending payments</div>
            <div className="text-lg font-semibold text-slate-100">$3,200</div>
            <div className="text-[11px] text-slate-400 mt-1">2 invoices pending</div>
          </div>
          <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Active campaigns</div>
            <div className="text-lg font-semibold text-slate-100">{activeCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">{filteredCampaigns.length} total campaigns</div>
          </div>
        </div>

        {/* Recent campaigns */}
        <div>
          <h2 className="text-sm font-semibold text-slate-100 mb-3">Recent campaigns</h2>
          <div className="space-y-[2px] rounded-2xl bg-white/2 border border-white/5 p-1">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No campaigns {activeTalentId ? 'for this talent' : 'found'}
              </div>
            ) : (
              filteredCampaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/campaigns?id=${c.id}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/5 transition cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-slate-100 group-hover:text-white">{c.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{c.brief}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {c.talents?.map((t)=>t.talent?.name).join(', ')}
                    </div>
                  </div>
                  <div className={cn(
                    "text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0 ml-3",
                    c.status === 'ACTIVE' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : c.status === 'DRAFT'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-neutral-500/20 text-neutral-300'
                  )}>
                    {c.status.toLowerCase()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Right column */}
      <aside className="w-[320px] space-y-4 hidden lg:block">
        {/* Inbox preview */}
        <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Inbox</h3>
          <div className="text-sm text-slate-400">No new messages</div>
        </div>

        {/* Upcoming payments */}
        <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Upcoming payments</h3>
          <div className="space-y-2">
            <div className="text-sm text-slate-400">No upcoming payments</div>
          </div>
        </div>

        {/* Wallet summary */}
        <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Wallet</h3>
          <div className="text-lg font-semibold text-slate-100">$0.00</div>
          <div className="text-[11px] text-slate-400 mt-1">Available balance</div>
        </div>
      </aside>
    </div>
  )
}
