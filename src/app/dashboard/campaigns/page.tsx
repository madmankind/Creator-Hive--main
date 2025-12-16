'use client'
import { useState, useEffect } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'
import useSWR from 'swr'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// Mock data
const mockCampaigns = [
  {
    id: '1',
    title: 'Summer Product Launch',
    brief: 'Need content creators for our new summer collection launch',
    status: 'ACTIVE',
    startDate: '2024-03-01',
    dueDate: '2024-03-15',
    talents: [
      { talentId: '1', talent: { name: 'Sarah Chen' }, status: 'IN_PROGRESS' },
      { talentId: '2', talent: { name: 'Marcus Johnson' }, status: 'ASSIGNED' }
    ]
  },
  {
    id: '2',
    title: 'Brand Awareness Campaign',
    brief: 'Looking for UGC creators to showcase our products',
    status: 'DRAFT',
    startDate: '2024-03-10',
    dueDate: '2024-03-25',
    talents: [
      { talentId: '3', talent: { name: 'Emma Rodriguez' }, status: 'ASSIGNED' }
    ]
  },
  {
    id: '3',
    title: 'Holiday Video Series',
    brief: 'Creating a series of holiday-themed videos',
    status: 'COMPLETED',
    startDate: '2024-02-01',
    dueDate: '2024-02-28',
    talents: [
      { talentId: '1', talent: { name: 'Sarah Chen' }, status: 'APPROVED' },
      { talentId: '3', talent: { name: 'Emma Rodriguez' }, status: 'APPROVED' }
    ]
  }
]

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Campaigns() {
  const { activeTalentId } = useAgencyFilter()
  const { data, mutate } = useSWR("/api/agency/campaigns", fetcher)
  const [showModal, setShowModal] = useState(false)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  
  // Use API data if available, otherwise fallback to mock data
  const campaigns = data?.data || mockCampaigns

  const filteredCampaigns = campaigns.filter((c: any)=>{
    if (!activeTalentId) return true
    return c.talents?.some((x: any)=>x.talentId===activeTalentId)
  })

  // Get selected campaign from URL or default to first
  const selectedId = searchParams.get('id') || filteredCampaigns[0]?.id
  const selectedCampaign = filteredCampaigns.find((c: any) => c.id === selectedId)

  // Highlight new campaign on mount
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newCampaign = params.get('new')
    if (newCampaign) {
      setHighlightedId(newCampaign)
      setTimeout(() => setHighlightedId(null), 3000)
      router.replace(`${pathname}?id=${newCampaign}`)
    }
  }, [pathname, router])

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-100">Campaigns</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your campaigns and track progress</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-white/90 transition"
        >
          + New campaign
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 gap-5 min-h-0">
        {/* Left: Campaign list */}
        <section className="w-[40%] max-w-sm space-y-[2px] overflow-y-auto pr-1">
          <div className="rounded-2xl bg-white/2 border border-white/5 p-1">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No campaigns {activeTalentId ? 'for this talent' : 'found'}
              </div>
            ) : (
              filteredCampaigns.map((campaign: any) => {
                const isSelected = campaign.id === selectedId
                return (
                  <button
                    key={campaign.id}
                    onClick={() => {
                      router.push(`${pathname}?id=${campaign.id}`)
                    }}
                    className={cn(
                      "flex items-start justify-between rounded-xl px-3 py-3 w-full text-left hover:bg-white/5 transition cursor-pointer group",
                      isSelected && 'bg-white/8 border-l-2 border-purple-500'
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-sm font-medium text-slate-100 group-hover:text-white mb-0.5">
                        {campaign.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mb-1">
                        {campaign.brief}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {campaign.talents?.length || 0} talent{campaign.talents?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0",
                      campaign.status === 'ACTIVE' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : campaign.status === 'DRAFT'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-neutral-500/20 text-neutral-300'
                    )}>
                      {campaign.status.toLowerCase()}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* Right: Campaign detail */}
        <section className="flex-1 rounded-2xl bg-white/3 border border-white/5 px-5 py-4 overflow-y-auto">
          {selectedCampaign ? (
            <div>
              {/* Top bar */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-100 mb-2">{selectedCampaign.title}</h2>
                  <div className={cn(
                    "inline-block text-[11px] px-2.5 py-1 rounded-full font-semibold",
                    selectedCampaign.status === 'ACTIVE' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : selectedCampaign.status === 'DRAFT'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-neutral-500/20 text-neutral-300'
                  )}>
                    {selectedCampaign.status.toLowerCase()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition">
                    View brief
                  </button>
                  <button className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition">
                    Message
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">Summary</h3>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-4">{selectedCampaign.brief}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Start date</div>
                    <div className="text-sm text-slate-100">
                      {new Date(selectedCampaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Due date</div>
                    <div className="text-sm text-slate-100">
                      {new Date(selectedCampaign.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned talents */}
              <div className="mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">Assigned talents</h3>
                <div className="space-y-2">
                  {selectedCampaign.talents?.map((assignment: any) => (
                    <div 
                      key={assignment.talentId} 
                      className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-slate-300">
                          {assignment.talent.name.charAt(0)}
                        </div>
                        <span className="text-[13px] font-medium text-slate-100">{assignment.talent.name}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                        assignment.status === 'IN_PROGRESS' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : assignment.status === 'SUBMITTED' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : assignment.status === 'APPROVED' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-neutral-500/20 text-neutral-300'
                      )}>
                        {assignment.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline placeholder */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-3">Timeline</h3>
                <div className="text-sm text-slate-400">No timeline items yet</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select a campaign to view details
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <NewCampaignModal 
          onClose={() => setShowModal(false)} 
          onSaved={() => { 
            setShowModal(false); 
            mutate(); 
          }} 
        />
      )}
    </div>
  )
}

function NewCampaignModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { data: me } = useSWR("/api/agency/me", fetcher);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const talents = me?.talents || [];

  async function save() {
    try {
      const res = await fetch("/api/agency/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief, talentIds: selected }),
      });
      if (res.ok) {
        onSaved();
      } else {
        alert("Failed to create campaign");
      }
    } catch (e) {
      alert("Network error");
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 backdrop-blur-sm">
      <div className="w-[560px] max-w-[95vw] rounded-3xl bg-[#111318] border border-white/5 shadow-[0_18px_45px_rgba(0,0,0,0.65)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-neutral-50">New Campaign</div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-100 transition w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <input 
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-[#7C3AED]/50 text-neutral-100 placeholder:text-neutral-400" 
            placeholder="Campaign title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <textarea 
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 min-h-[100px] outline-none focus:ring-2 focus:ring-[#7C3AED]/50 text-neutral-100 placeholder:text-neutral-400 resize-none" 
            placeholder="Campaign brief and requirements" 
            value={brief} 
            onChange={e => setBrief(e.target.value)} 
          />
        </div>
        <div className="mt-5">
          <div className="text-sm text-neutral-300 mb-3">Assign talents</div>
          <div className="flex flex-wrap gap-2">
            {talents.map((t: any) => {
              const active = selected.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(s => active ? s.filter(x => x !== t.id) : [...s, t.id])}
                  className={`
                    px-3 py-1.5 rounded-full text-sm border transition
                    ${active 
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#A855F7]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
                    }
                  `}
                >
                  {t.name} {t.role ? `· ${t.role}` : ''}
                </button>
              );
            })}
          </div>
          {talents.length === 0 && (
            <div className="text-sm text-neutral-400 py-4">No talents found. Add talents in your agency settings.</div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="rounded-full bg-white/5 border border-white/10 px-4 h-10 hover:bg-white/10 transition text-sm text-neutral-300"
          >
            Cancel
          </button>
          <button 
            onClick={save}
            disabled={!title.trim() || !brief.trim()}
            className="rounded-full bg-[#7C3AED] text-white px-4 h-10 hover:bg-[#8B5CF6] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
