'use client'
import useSWR from 'swr'
import { useAgencyFilter } from '@/store/agencyFilter'

type InvoiceResponse = {
  data: Array<{
    id: string;
    amount: number;
    status: string;
    dueDate: string | null;
    paidDate: string | null;
    talentId: string;
    talent?: { name: string | null };
    campaign?: { title: string | null };
  }>;
};

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Invoices() {
  const { activeTalentId } = useAgencyFilter()
  const { data } = useSWR<InvoiceResponse>('/api/invoices', fetcher)
  const invoices = (data?.data || []).filter((inv)=>{
    if (!activeTalentId) return true
    return inv.talentId === activeTalentId
  })
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const pendingTotal = invoices.filter((inv) => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.amount, 0)
  const overdueTotal = invoices.filter((inv) => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold">Invoices</h1>
        <button className="rounded-full bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition text-sm">
          Export
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Total invoiced</div>
          <div className="text-2xl font-semibold mt-1">
            ${totalInvoiced.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Pending</div>
          <div className="text-2xl font-semibold mt-1">
            ${pendingTotal.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm text-white/70">Overdue</div>
          <div className="text-2xl font-semibold mt-1 text-red-400">
            ${overdueTotal.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="text-sm text-white/70">All invoices</div>
        </div>
        <div className="divide-y divide-white/10">
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No invoices {activeTalentId ? 'for this talent' : 'found'}
            </div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 hover:bg-white/3 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{invoice.id}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'PAID' ? 'bg-green-500/20 text-green-300' :
                        invoice.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {invoice.status.toLowerCase()}
                      </div>
                    </div>
                    <div className="text-sm text-white/60 mt-1">{invoice.talent?.name || 'Talent'} • {invoice.campaign?.title || 'Campaign'}</div>
                    <div className="text-xs text-white/50 mt-1">
                      Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'} {invoice.paidDate && `• Paid: ${new Date(invoice.paidDate).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${invoice.amount.toLocaleString()}</div>
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



