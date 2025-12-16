'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// Mock data for revenue analytics
const mockRevenueData = [
  {
    id: 'REV-001',
    talentId: '1',
    talentName: 'Sarah Chen',
    campaignName: 'Summer Product Launch',
    revenue: 8500,
    commission: 1700,
    netRevenue: 6800,
    date: '2024-03-10',
    status: 'COMPLETED'
  },
  {
    id: 'REV-002',
    talentId: '2',
    talentName: 'Marcus Johnson',
    campaignName: 'Brand Awareness Campaign',
    revenue: 6200,
    commission: 1240,
    netRevenue: 4960,
    date: '2024-03-12',
    status: 'PENDING'
  },
  {
    id: 'REV-003',
    talentId: '1',
    talentName: 'Sarah Chen',
    campaignName: 'Holiday Video Series',
    revenue: 4800,
    commission: 960,
    netRevenue: 3840,
    date: '2024-02-28',
    status: 'COMPLETED'
  },
  {
    id: 'REV-004',
    talentId: '3',
    talentName: 'Emma Rodriguez',
    campaignName: 'Product Unboxing Series',
    revenue: 3200,
    commission: 640,
    netRevenue: 2560,
    date: '2024-03-05',
    status: 'COMPLETED'
  }
]

export default function Revenue() {
  const { activeTalentId } = useAgencyFilter()
  const [revenueData] = useState(mockRevenueData)
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filteredData = revenueData.filter((item) => {
    if (activeTalentId && item.talentId !== activeTalentId) return false
    return true
  })

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0)
  const totalCommission = filteredData.reduce((sum, item) => sum + item.commission, 0)
  const totalNetRevenue = filteredData.reduce((sum, item) => sum + item.netRevenue, 0)
  const completedRevenue = filteredData
    .filter(item => item.status === 'COMPLETED')
    .reduce((sum, item) => sum + item.revenue, 0)
  const pendingRevenue = filteredData
    .filter(item => item.status === 'PENDING')
    .reduce((sum, item) => sum + item.revenue, 0)

  const selectedId = searchParams.get('id') || filteredData[0]?.id
  const selectedItem = filteredData.find((item) => item.id === selectedId)

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-100">Revenue</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track your earnings and commissions</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
        >
          <option value="all">All time</option>
          <option value="month">This month</option>
          <option value="quarter">This quarter</option>
          <option value="year">This year</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Total Revenue</div>
          <div className="text-lg font-semibold text-slate-100">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Net Revenue</div>
          <div className="text-lg font-semibold text-slate-100">${totalNetRevenue.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Commissions</div>
          <div className="text-lg font-semibold text-slate-100">${totalCommission.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-white/3 border border-white/5 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Completed</div>
          <div className="text-lg font-semibold text-slate-100">${completedRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">${pendingRevenue.toLocaleString()} pending</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 gap-5 min-h-0">
        {/* Left: Revenue list */}
        <section className="w-[40%] max-w-sm space-y-[2px] overflow-y-auto pr-1">
          <div className="rounded-2xl bg-white/2 border border-white/5 p-1">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No revenue data found</div>
            ) : (
              filteredData.map((item) => {
                const isSelected = item.id === selectedId
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(`${pathname}?id=${item.id}`)}
                    className={cn(
                      "flex items-start justify-between rounded-xl px-3 py-3 w-full text-left hover:bg-white/5 transition cursor-pointer group",
                      isSelected && 'bg-white/8 border-l-2 border-purple-500'
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-sm font-medium text-slate-100 group-hover:text-white mb-0.5">
                        {item.campaignName}
                      </div>
                      <div className="text-[11px] text-slate-400 mb-1">{item.talentName}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-sm font-semibold text-slate-100">${item.revenue.toLocaleString()}</div>
                      <div className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1",
                        item.status === 'COMPLETED' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      )}>
                        {item.status.toLowerCase()}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* Right: Revenue detail */}
        <section className="flex-1 rounded-2xl bg-white/3 border border-white/5 px-5 py-4 overflow-y-auto">
          {selectedItem ? (
            <div>
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 mb-1">{selectedItem.campaignName}</h2>
                  <div className="text-sm text-slate-400">{selectedItem.talentName}</div>
                </div>
                <div className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full font-semibold",
                  selectedItem.status === 'COMPLETED' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-amber-500/20 text-amber-300'
                )}>
                  {selectedItem.status.toLowerCase()}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Revenue breakdown</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total revenue</span>
                      <span className="text-slate-100 font-medium">${selectedItem.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Commission (20%)</span>
                      <span className="text-slate-400">-${selectedItem.commission.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between">
                      <span className="text-sm font-semibold text-slate-100">Net revenue</span>
                      <span className="text-sm font-semibold text-slate-100">${selectedItem.netRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Date</div>
                  <div className="text-sm text-slate-100">
                    {new Date(selectedItem.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select a revenue item to view details
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
