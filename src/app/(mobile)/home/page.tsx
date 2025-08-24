'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign } from 'lucide-react';

// Mock data
const kpis = [
  {
    title: 'Available Balance',
    value: 2450.00,
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    title: 'Pending',
    value: 1250.00,
    change: '+5.2%',
    changeType: 'positive' as const,
    icon: Clock,
  },
  {
    title: 'Last Payment',
    value: 850.00,
    change: '2 days ago',
    changeType: 'positive' as const,
    icon: ArrowDownRight,
  },
  {
    title: 'This Month',
    value: 5200.00,
    change: '+18.3%',
    changeType: 'positive' as const,
    icon: ArrowUpRight,
  },
];

const activities = [
  {
    id: 1,
    type: 'payment_received',
    title: 'Payment received from Acme Corp',
    amount: 850.00,
    timestamp: '2 hours ago',
    status: 'completed',
  },
  {
    id: 2,
    type: 'invoice_sent',
    title: 'Invoice sent to TechStart Inc',
    amount: 1200.00,
    timestamp: '1 day ago',
    status: 'pending',
  },
  {
    id: 3,
    type: 'payout',
    title: 'Payout to bank account',
    amount: 2000.00,
    timestamp: '3 days ago',
    status: 'completed',
  },
  {
    id: 4,
    type: 'payment_received',
    title: 'Payment received from Creative Studio',
    amount: 650.00,
    timestamp: '5 days ago',
    status: 'completed',
  },
];

export default function HomePage() {
  return (
    <div className="container space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="h1">Good morning</h1>
        <p className="body text-muted">Here&apos;s what&apos;s happening with your payments</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlowCard key={kpi.title} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-muted" />
                <span className={`text-xs font-medium ${
                  kpi.changeType === 'positive' 
                    ? 'text-success' 
                    : kpi.changeType === 'negative'
                    ? 'text-danger'
                    : 'text-muted'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted">{kpi.title}</p>
                <p className="h2">{formatCurrency(kpi.value, 'USD')}</p>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* Recent Activity */}
      <GlowCard className="p-6 space-y-4">
        <h2 className="h3">Recent Activity</h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0">
                <p className="body font-medium text-text truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted">
                  {activity.timestamp}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="body font-semibold">
                  {activity.type === 'payout' ? '-' : '+'}
                  {formatCurrency(activity.amount, 'USD')}
                </span>
                <div className={`h-2 w-2 rounded-full ${
                  activity.status === 'completed' 
                    ? 'bg-success' 
                    : 'bg-warn'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}