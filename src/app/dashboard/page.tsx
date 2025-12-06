'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold">Overview</h1>
        <button className="rounded-full bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition text-sm">
          + New Campaign
        </button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Total revenue</div>
          <div className="text-2xl font-semibold mt-1">$24,500</div>
          <div className="text-xs text-white/50 mt-1">+12% from last month</div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Pending payments</div>
          <div className="text-2xl font-semibold mt-1">$3,200</div>
          <div className="text-xs text-white/50 mt-1">2 invoices pending</div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Active campaigns</div>
          <div className="text-2xl font-semibold mt-1">{filteredCampaigns.filter(c => c.status === 'ACTIVE').length}</div>
          <div className="text-xs text-white/50 mt-1">{filteredCampaigns.length} total campaigns</div>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-white/70">Recent campaigns</div>
          {activeTalentId && (
            <div className="text-xs text-white/50">
              Filtered by {mockCampaigns.find(c => c.talents.some(t => t.talentId === activeTalentId))?.talents.find(t => t.talentId === activeTalentId)?.talent.name}
            </div>
          )}
        </div>
        <div className="space-y-3">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              No campaigns {activeTalentId ? 'for this talent' : 'found'}
            </div>
          ) : (
            filteredCampaigns.map((c)=>(
              <div key={c.id} className="rounded-lg bg-white/3 ring-1 ring-white/10 p-4 hover:bg-white/5 transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-white/60 truncate mt-1">{c.brief}</div>
                    <div className="text-xs text-white/50 mt-2">
                      {c.talents?.map((t)=>t.talent?.name).join(', ')}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    c.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                    c.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {c.status.toLowerCase()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}







