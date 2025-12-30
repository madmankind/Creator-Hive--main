'use client'
import useSWR from 'swr'
import { useAgencyFilter } from '@/store/agencyFilter'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Gauge, 
  FolderKanban, 
  Wallet,
  Compass
} from 'lucide-react'

type AgencyResponse = {
  user?: { email: string };
  agency?: { name: string };
  talents?: Array<{ id: string; name: string; role?: string | null }>;
};

const fetcher = (url: string) => fetch(url).then(res => res.json())

const navItems = [
  { href: '/dashboard/track', label: 'Track', icon: Gauge },
  { href: '/dashboard/manage', label: 'Manage', icon: FolderKanban },
  { href: '/dashboard/pay', label: 'Pay', icon: Wallet },
  { href: '/dashboard/discover', label: 'Discover', icon: Compass },
]

export default function Sidebar() {
  const { activeTalentId, setTalentId } = useAgencyFilter()
  const { data } = useSWR<AgencyResponse>('/api/agency/me', fetcher)
  const pathname = usePathname()
  const talents = data?.talents ?? []
  const agencyName = data?.agency?.name ?? 'My Agency'
  const userEmail = data?.user?.email ?? 'member@creator.hive'

  return (
    <aside className="flex w-[260px] flex-col border-r border-[#E7E9F2] bg-white text-slate-900">
      {/* Logo row */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E7E9F2]">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-xs font-semibold shadow-lg shadow-purple-200/50 flex-shrink-0">
          CH
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold tracking-tight text-slate-900 block leading-tight">Creator Hive</span>
          <span className="text-[11px] text-slate-500 block leading-tight">Dashboard</span>
        </div>
      </div>

      {/* Agency & talents */}
      <div className="px-5 py-4 space-y-4 text-xs">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Agency</div>
          <div className="rounded-xl bg-[#F6F7FB] px-3 py-2 text-slate-900 text-sm border border-[#E7E9F2]">
            {agencyName}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Talents</div>
          <button 
            onClick={() => setTalentId(null)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-slate-700 hover:bg-[#F6F7FB] transition text-sm border border-transparent",
              activeTalentId === null && 'bg-[#F6F7FB] border-[#E7E9F2]'
            )}
          >
            <span>All talents</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>
        </div>

        {/* Talent list */}
        <div className="space-y-1 pt-1">
          {talents.length === 0 && (
            <div className="text-[11px] text-slate-500">No assigned talent yet</div>
          )}
          {talents.map((t) => (
            <button
              key={t.id}
              onClick={() => setTalentId(t.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-[#F6F7FB] transition text-sm border border-transparent",
                activeTalentId === t.id && 'bg-[#F6F7FB] border-[#E7E9F2]'
              )}
            >
              <div className="w-6 h-6 rounded-full bg-[#F6F7FB] flex items-center justify-center text-[10px] font-medium text-slate-700 flex-shrink-0 border border-[#E7E9F2]">
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
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 relative overflow-hidden",
                isActive
                  ? 'bg-[#F1EEFF] text-slate-900 border border-transparent'
                  : 'text-slate-600 hover:bg-[#F6F7FB]'
              )}
            >
              {isActive && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500 rounded-r-lg" />}
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? 'text-purple-600' : 'text-slate-500'
              )} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="mt-auto flex items-center gap-3 px-5 py-4 border-t border-[#E7E9F2]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F7FB] text-xs font-medium text-slate-700 border border-[#E7E9F2]">
          U
        </div>
        <div className="text-xs leading-tight flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">{agencyName}</div>
          <div className="text-[11px] text-slate-500 truncate">{userEmail}</div>
        </div>
      </div>
    </aside>
  )
}
