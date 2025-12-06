'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'
import useSWR from 'swr'

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
  }
]

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Campaigns() {
  const { activeTalentId } = useAgencyFilter()
  const { data, mutate } = useSWR("/api/agency/campaigns", fetcher)
  const [showModal, setShowModal] = useState(false)
  
  // Use API data if available, otherwise fallback to mock data
  const campaigns = data?.data || mockCampaigns

  const filteredCampaigns = campaigns.filter((c: any)=>{
    if (!activeTalentId) return true
    return c.talents?.some((x: any)=>x.talentId===activeTalentId)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold">Campaigns</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="rounded-full bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition text-sm"
        >
          + New Campaign
        </button>
      </div>

      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            No campaigns {activeTalentId ? 'for this talent' : 'found'}
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-6 hover:bg-white/7 transition cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{campaign.title}</h3>
                  <p className="text-white/60 mt-1">{campaign.brief}</p>
                </div>
                <div className={`text-xs px-3 py-1 rounded-full ${
                  campaign.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                  campaign.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {campaign.status.toLowerCase()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Start date:</span>
                  <span className="ml-2">{campaign.startDate}</span>
                </div>
                <div>
                  <span className="text-white/50">Due date:</span>
                  <span className="ml-2">{campaign.dueDate}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-white/50 mb-2">Assigned talents:</div>
                <div className="flex flex-wrap gap-2">
                  {campaign.talents.map((assignment) => (
                    <div key={assignment.talentId} className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                      <span className="text-sm">{assignment.talent.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        assignment.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                        assignment.status === 'SUBMITTED' ? 'bg-purple-500/20 text-purple-300' :
                        assignment.status === 'APPROVED' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {assignment.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
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
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50">
      <div className="w-[560px] max-w-[95vw] rounded-2xl bg-[#0D1117] ring-1 ring-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-medium">New Campaign</div>
          <button onClick={onClose} className="text-white/60 hover:text-white/90">✕</button>
        </div>
        <div className="grid gap-3">
          <input 
            className="rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-2.5 outline-none focus:ring-white/20 text-white placeholder:text-white/40" 
            placeholder="Campaign title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <textarea 
            className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-2.5 min-h-[100px] outline-none focus:ring-white/20 text-white placeholder:text-white/40 resize-none" 
            placeholder="Campaign brief and requirements" 
            value={brief} 
            onChange={e => setBrief(e.target.value)} 
          />
        </div>
        <div className="mt-4">
          <div className="text-sm text-white/70 mb-2">Assign talents</div>
          <div className="flex flex-wrap gap-2">
            {talents.map((t: any) => {
              const active = selected.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(s => active ? s.filter(x => x !== t.id) : [...s, t.id])}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    active 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  {t.name} {t.role ? `· ${t.role}` : ''}
                </button>
              );
            })}
          </div>
          {talents.length === 0 && (
            <div className="text-sm text-white/50 py-4">No talents found. Add talents in your agency settings.</div>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="rounded-full bg-white/5 border border-white/10 px-4 h-10 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button 
            onClick={save}
            disabled={!title.trim() || !brief.trim()}
            className="rounded-full bg-white/10 border border-white/10 px-4 h-10 hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
