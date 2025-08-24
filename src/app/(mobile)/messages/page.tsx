'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { Search, MessageSquare } from 'lucide-react';

// Mock data
const conversations = [
  {
    id: 1,
    name: 'Acme Corp',
    lastMessage: 'Thanks for the quick turnaround on the project!',
    timestamp: '2 hours ago',
    unread: 0,
    avatar: 'AC',
  },
  {
    id: 2,
    name: 'TechStart Inc',
    lastMessage: 'Can we schedule a call to discuss the next phase?',
    timestamp: '1 day ago',
    unread: 2,
    avatar: 'TS',
  },
  {
    id: 3,
    name: 'Creative Studio',
    lastMessage: 'The designs look perfect, proceeding with payment.',
    timestamp: '3 days ago',
    unread: 0,
    avatar: 'CS',
  },
  {
    id: 4,
    name: 'Digital Agency',
    lastMessage: 'Invoice received, processing payment now.',
    timestamp: '1 week ago',
    unread: 1,
    avatar: 'DA',
  },
];

export default function MessagesPage() {
  return (
    <div className="container space-y-6 py-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="h1">Messages</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <GlowCard key={conversation.id} className="p-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-accent">
                  {conversation.avatar}
                </span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="body font-semibold text-text truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-muted flex-shrink-0">
                    {conversation.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted truncate">
                  {conversation.lastMessage}
                </p>
              </div>
              
              {/* Unread indicator */}
              {conversation.unread > 0 && (
                <div className="flex-shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {conversation.unread}
                  </span>
                </div>
              )}
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Empty state for when no conversations */}
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted mb-4" />
          <h3 className="h3 mb-2">No messages yet</h3>
          <p className="body text-muted">
            Start a conversation with your clients
          </p>
        </div>
      )}
    </div>
  );
}