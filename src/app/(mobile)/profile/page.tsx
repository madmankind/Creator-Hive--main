'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { User, Settings, CreditCard, FileText, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

// Mock profile data
const profile = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'AJ',
  completionRate: 95,
  memberSince: 'January 2023',
};

const menuItems = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Update your profile and contact details',
    icon: User,
    href: '/settings/profile',
  },
  {
    id: 'payment',
    title: 'Payment Methods',
    description: 'Manage cards and bank accounts',
    icon: CreditCard,
    href: '/settings/payment-methods',
  },
  {
    id: 'invoices',
    title: 'Invoices & Billing',
    description: 'View invoices and billing history',
    icon: FileText,
    href: '/settings/invoices',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Password, 2FA, and privacy settings',
    icon: Shield,
    href: '/settings/security',
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Get help and contact support',
    icon: HelpCircle,
    href: '/help',
  },
];

export default function ProfilePage() {
  return (
    <div className="container space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="h1">Profile</h1>
        <p className="body text-muted">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <GlowCard className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-xl font-semibold text-accent">
              {profile.avatar}
            </span>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1">
            <h2 className="h2">{profile.name}</h2>
            <p className="body text-muted">{profile.email}</p>
            <p className="text-xs text-muted">Member since {profile.memberSince}</p>
          </div>
          
          {/* Edit Button */}
          <button className="p-2 text-muted hover:text-text transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
        
        {/* Completion Rate */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Profile Completion</span>
            <span className="text-sm font-medium text-text">{profile.completionRate}%</span>
          </div>
          <div className="w-full bg-surface-2 rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300" 
              style={{ width: `${profile.completionRate}%` }}
            />
          </div>
        </div>
      </GlowCard>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <GlowCard key={item.id} className="p-4">
              <button className="w-full flex items-center gap-4 text-left">
                <div className="flex-shrink-0 w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="body font-medium text-text">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted">
                    {item.description}
                  </p>
                </div>
                
                <ChevronRight className="h-5 w-5 text-muted flex-shrink-0" />
              </button>
            </GlowCard>
          );
        })}
      </div>

      {/* Sign Out */}
      <GlowCard className="p-4">
        <button className="w-full flex items-center gap-4 text-left text-danger">
          <div className="flex-shrink-0 w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
            <LogOut className="h-5 w-5 text-danger" />
          </div>
          
          <div className="flex-1">
            <h3 className="body font-medium">Sign Out</h3>
            <p className="text-xs text-muted">Sign out of your account</p>
          </div>
        </button>
      </GlowCard>
    </div>
  );
}