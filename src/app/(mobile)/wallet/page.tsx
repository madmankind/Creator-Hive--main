'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Landmark, Calendar, Plus, ExternalLink } from 'lucide-react';

// Mock data
const balance = {
  available: 2450.00,
  pending: 1250.00,
  nextPayout: {
    amount: 2450.00,
    date: '2024-01-15',
  },
};

const paymentMethods = [
  {
    id: 1,
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    isDefault: true,
  },
  {
    id: 2,
    type: 'bank',
    last4: '1234',
    name: 'Chase Checking',
    isDefault: false,
  },
];

const payouts = [
  {
    id: 1,
    amount: 2000.00,
    status: 'completed',
    date: '2024-01-12',
    method: 'Bank account •••• 1234',
  },
  {
    id: 2,
    amount: 1500.00,
    status: 'pending',
    date: '2024-01-15',
    method: 'Bank account •••• 1234',
  },
];

export default function WalletPage() {
  return (
    <div className="container space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="h1">Wallet</h1>
        <p className="body text-muted">Manage your balance and payment methods</p>
      </div>

      {/* Balance Overview */}
      <GlowCard className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Available Balance</p>
              <p className="display">{formatCurrency(balance.available, 'USD')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted">Pending</p>
              <p className="h3">{formatCurrency(balance.pending, 'USD')}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Next Payout</p>
              <p className="h3">{formatCurrency(balance.nextPayout.amount, 'USD')}</p>
              <p className="text-xs text-muted">Jan 15, 2024</p>
            </div>
          </div>
        </div>

        <InlineAlert variant="info">
          Your next automatic payout is scheduled for January 15th
        </InlineAlert>
      </GlowCard>

      {/* Payment Methods */}
      <GlowCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h3">Payment Methods</h2>
          <button className="flex items-center gap-2 text-accent text-sm font-medium">
            <Plus className="h-4 w-4" />
            Add Method
          </button>
        </div>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
              <div className="flex items-center gap-3">
                {method.type === 'card' ? (
                  <CreditCard className="h-5 w-5 text-muted" />
                ) : (
                  <Landmark className="h-5 w-5 text-muted" />
                )}
                <div>
                  <p className="body font-medium">
                    {method.type === 'card' 
                      ? `${method.brand} •••• ${method.last4}`
                      : `${method.name} •••• ${method.last4}`
                    }
                  </p>
                  {method.isDefault && (
                    <p className="text-xs text-accent">Default</p>
                  )}
                </div>
              </div>
              <button className="p-2 text-muted hover:text-text">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Recent Payouts */}
      <GlowCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h3">Recent Payouts</h2>
          <button className="text-accent text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted" />
                <div>
                  <p className="body font-medium">
                    {formatCurrency(payout.amount, 'USD')}
                  </p>
                  <p className="text-xs text-muted">{payout.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">
                  {new Date(payout.date).toLocaleDateString()}
                </p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  payout.status === 'completed'
                    ? 'bg-success/10 text-success'
                    : 'bg-warn/10 text-warn'
                }`}>
                  {payout.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}