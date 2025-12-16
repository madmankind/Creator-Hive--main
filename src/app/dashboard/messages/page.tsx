'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// Mock data
const mockMessages = [
  {
    id: '1',
    talentId: '1',
    talentName: 'Sarah Chen',
    subject: 'Campaign deliverables ready',
    preview: 'Hi! I\'ve completed the first set of photos for the summer campaign...',
    timestamp: '2 hours ago',
    unread: true,
    body: 'Hi! I\'ve completed the first set of photos for the summer campaign. They\'re ready for review. Let me know if you need any adjustments!'
  },
  {
    id: '2',
    talentId: '2',
    talentName: 'Marcus Johnson',
    subject: 'Question about video specs',
    preview: 'Quick question about the video resolution requirements...',
    timestamp: '1 day ago',
    unread: false,
    body: 'Quick question about the video resolution requirements. Should I deliver in 4K or is 1080p sufficient?'
  },
  {
    id: '3',
    talentId: '3',
    talentName: 'Emma Rodriguez',
    subject: 'Available for new projects',
    preview: 'Just finished my current project and available for new work...',
    timestamp: '3 days ago',
    unread: false,
    body: 'Just finished my current project and available for new work. Let me know if you have any upcoming campaigns!'
  }
]

export default function Messages() {
  const { activeTalentId } = useAgencyFilter()
  const [messages] = useState(mockMessages)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filteredMessages = messages.filter((m)=>{
    if (!activeTalentId) return true
    return m.talentId === activeTalentId
  })

  const selectedId = searchParams.get('id') || filteredMessages[0]?.id
  const selectedMessage = filteredMessages.find((m) => m.id === selectedId)

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-100">Inbox</h1>
          <p className="text-sm text-slate-400 mt-0.5">Messages from your talents</p>
        </div>
        <button className="rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-white/90 transition">
          Compose
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 gap-5 min-h-0">
        {/* Left: Message list */}
        <section className="w-[40%] max-w-sm space-y-[2px] overflow-y-auto pr-1">
          <div className="rounded-2xl bg-white/2 border border-white/5 p-1">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No messages {activeTalentId ? 'from this talent' : 'found'}
              </div>
            ) : (
              filteredMessages.map((message) => {
                const isSelected = message.id === selectedId
                return (
                  <button
                    key={message.id}
                    onClick={() => router.push(`${pathname}?id=${message.id}`)}
                    className={cn(
                      "flex items-start justify-between rounded-xl px-3 py-3 w-full text-left hover:bg-white/5 transition cursor-pointer group",
                      isSelected && 'bg-white/8 border-l-2 border-purple-500',
                      message.unread && !isSelected && 'bg-white/3'
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={cn(
                          "text-sm font-medium",
                          isSelected ? 'text-slate-100' : message.unread ? 'text-slate-100' : 'text-slate-400'
                        )}>
                          {message.talentName}
                        </div>
                        {message.unread && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        )}
                      </div>
                      <div className={cn(
                        "text-[13px] mb-1",
                        isSelected ? 'text-slate-200' : 'text-slate-400'
                      )}>
                        {message.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {message.preview}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                      {message.timestamp}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* Right: Message detail */}
        <section className="flex-1 rounded-2xl bg-white/3 border border-white/5 px-5 py-4 overflow-y-auto">
          {selectedMessage ? (
            <div>
              {/* Top bar */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-100 mb-1">{selectedMessage.subject}</h2>
                  <div className="text-sm text-slate-400">{selectedMessage.talentName} · {selectedMessage.timestamp}</div>
                </div>
                <button className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition">
                  Reply
                </button>
              </div>

              {/* Message body */}
              <div className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.body}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select a message to view
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
