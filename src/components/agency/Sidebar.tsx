'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'
import Link from 'next/link'

// Mock data for demo - in production this would come from API
const mockTalents = [
  { id: '1', name: 'Sarah Chen', role: 'Content Creator' },
  { id: '2', name: 'Marcus Johnson', role: 'Videographer' },
  { id: '3', name: 'Emma Rodriguez', role: 'UGC Creator' },
]

export default function Sidebar() {
  const { activeTalentId, setTalentId } = useAgencyFilter()
  const [talents] = useState(mockTalents) // In production: useSWR('/api/agency/me', fetcher)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
        <div className="text-sm text-white/70">Agency</div>
        <div className="text-[15px] font-medium">Demo Agency</div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/50">Talents</div>
        <button
          onClick={()=>setTalentId(null)}
          className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
            activeTalentId===null ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
        >
          All talents
        </button>
        {talents.map((t)=>(
          <button
            key={t.id}
            onClick={()=>setTalentId(t.id)}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition ${
              activeTalentId===t.id ? 'bg-white/10' : ''
            }`}
          >
            {t.name} {t.role ? `· ${t.role}` : ''}
          </button>
        ))}
      </div>

      <nav className="pt-2 border-t border-white/10">
        <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition">Overview</Link>
        <Link href="/dashboard/campaigns" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition">Campaigns</Link>
        <Link href="/dashboard/revenue" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition">Revenue</Link>
        <Link href="/discovery" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition">Discovery</Link>
        <Link href="/dashboard/messages" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition">Inbox</Link>
        <Link href="/dashboard/invoices" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition">Invoices</Link>
        <Link href="/dashboard/wallet" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition">Wallet</Link>
      </nav>
    </div>
  )
}
