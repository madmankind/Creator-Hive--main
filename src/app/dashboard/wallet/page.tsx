'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'

// Mock data
const mockTransactions = [
  {
    id: 'TXN-001',
    talentId: '1',
    talentName: 'Sarah Chen',
    type: 'PAYOUT',
    amount: 2500,
    description: 'Summer Product Launch - Final payment',
    date: '2024-03-10',
    status: 'COMPLETED'
  },
  {
    id: 'TXN-002',
    talentId: '2',
    talentName: 'Marcus Johnson',
    type: 'PENDING',
    amount: 1800,
    description: 'Brand Awareness Campaign - Milestone 1',
    date: '2024-03-12',
    status: 'PENDING'
  },
  {
    id: 'TXN-003',
    talentId: '1',
    talentName: 'Sarah Chen',
    type: 'PAYOUT',
    amount: 1200,
    description: 'Holiday Video Series - Partial payment',
    date: '2024-02-28',
    status: 'COMPLETED'
  }
]

export default function Wallet() {
  const { activeTalentId } = useAgencyFilter()
  const [transactions] = useState(mockTransactions)

  const filteredTransactions = transactions.filter((txn)=>{
    if (!activeTalentId) return true
    return txn.talentId === activeTalentId
  })

  const totalPaid = filteredTransactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0)
  const totalPending = filteredTransactions.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold">Wallet</h1>
        <button className="rounded-full bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition text-sm">
          Add Funds
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Available balance</div>
          <div className="text-2xl font-semibold mt-1">$5,420</div>
          <div className="text-xs text-white/50 mt-1">Ready to withdraw</div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Total paid out</div>
          <div className="text-2xl font-semibold mt-1">${totalPaid.toLocaleString()}</div>
          <div className="text-xs text-white/50 mt-1">To talents</div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Pending payouts</div>
          <div className="text-2xl font-semibold mt-1">${totalPending.toLocaleString()}</div>
          <div className="text-xs text-white/50 mt-1">Awaiting approval</div>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-sm text-white/70">Recent transactions</div>
        </div>
        <div className="divide-y divide-white/10">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No transactions {activeTalentId ? 'for this talent' : 'found'}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-white/3 transition">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{transaction.description}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {transaction.status.toLowerCase()}
                      </div>
                    </div>
                    <div className="text-sm text-white/60 mt-1">{transaction.talentName}</div>
                    <div className="text-xs text-white/50 mt-1">{transaction.date}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'PAYOUT' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {transaction.type === 'PAYOUT' ? '-' : '+'}${transaction.amount.toLocaleString()}
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







