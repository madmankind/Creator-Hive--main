'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold">Revenue</h1>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="rounded-full bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="all">All time</option>
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
            <option value="year">This year</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Total Revenue</div>
          <div className="text-2xl font-semibold mt-1">${totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-white/50 mt-1">All campaigns</div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Net Revenue</div>
          <div className="text-2xl font-semibold mt-1">${totalNetRevenue.toLocaleString()}</div>
          <div className="text-xs text-white/50 mt-1">After commissions</div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Commissions</div>
          <div className="text-2xl font-semibold mt-1">${totalCommission.toLocaleString()}</div>
          <div className="text-xs text-white/50 mt-1">20% agency fee</div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Completed</div>
          <div className="text-2xl font-semibold mt-1">${completedRevenue.toLocaleString()}</div>
          <div className="text-xs text-white/50 mt-1">${pendingRevenue.toLocaleString()} pending</div>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-sm text-white/70">Revenue by Campaign</div>
        </div>
        <div className="divide-y divide-white/10">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No revenue data {activeTalentId ? 'for this talent' : 'found'}
            </div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="p-4 hover:bg-white/3 transition">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{item.campaignName}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {item.status.toLowerCase()}
                      </div>
                    </div>
                    <div className="text-sm text-white/60 mt-1">{item.talentName}</div>
                    <div className="text-xs text-white/50 mt-1">{item.date}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-semibold text-green-400">
                      ${item.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/50">
                      Net: ${item.netRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/50">
                      Commission: ${item.commission.toLocaleString()}
                    </div>
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

