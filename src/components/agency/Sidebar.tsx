'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FolderKanban, 
  TrendingUp, 
  Search, 
  Inbox, 
  FileText, 
  Wallet
} from 'lucide-react'

// Mock data for demo - in production this would come from API
const mockTalents = [
  { id: '1', name: 'Sarah Chen', role: 'Content Creator' },
  { id: '2', name: 'Marcus Johnson', role: 'Videographer' },
  { id: '3', name: 'Emma Rodriguez', role: 'UGC Creator' },
]

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: FolderKanban },
  { href: '/dashboard/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/discovery', label: 'Discovery', icon: Search },
  { href: '/dashboard/messages', label: 'Inbox', icon: Inbox },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
]

export default function Sidebar() {
  const { activeTalentId, setTalentId } = useAgencyFilter()
  const [talents] = useState(mockTalents) // In production: useSWR('/api/agency/me', fetcher)
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col border-r border-white/5 bg-black/40 backdrop-blur-md">
      {/* Logo row */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-xs font-semibold shadow-lg shadow-purple-500/40">
          CH
        </div>
        <span className="text-sm font-medium tracking-tight text-slate-100">Creator Hive</span>
      </div>

      {/* Agency & talents */}
      <div className="px-5 py-4 space-y-4 text-xs">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Agency</div>
          <div className="rounded-xl bg-white/5 px-3 py-2 text-slate-100 text-sm">
            Demo Agency
          </div>
        </div>
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Talents</div>
          <button 
            onClick={() => setTalentId(null)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-slate-300 hover:bg-white/6 transition text-sm",
              activeTalentId === null && 'bg-white/8'
            )}
          >
            <span>All talents</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>
        </div>

        {/* Talent list */}
        <div className="space-y-1 pt-1">
          {talents.map((t) => (
            <button
              key={t.id}
              onClick={() => setTalentId(t.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-slate-300 hover:bg-white/6 transition text-sm",
                activeTalentId === t.id && 'bg-white/8'
              )}
            >
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-slate-300 flex-shrink-0">
                {t.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium truncate">{t.name}</div>
                {t.role && (
                  <div className="text-[10px] text-slate-500 truncate">{t.role}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="mt-2 flex-1 px-2 space-y-1 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                isActive
                  ? 'bg-gradient-to-r from-purple-600/40 to-purple-900/40 text-white border border-purple-500/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              )}
            >
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? 'text-white' : 'text-slate-500'
              )} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="mt-auto flex items-center gap-3 px-5 py-4 border-t border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-slate-300">
          U
        </div>
        <div className="text-xs leading-tight flex-1 min-w-0">
          <div className="font-medium text-slate-100 truncate">User</div>
          <div className="text-[11px] text-slate-500 truncate">user@example.com</div>
        </div>
      </div>
    </aside>
  )
}
