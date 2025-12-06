'use client'
import { useState } from 'react'
import { useAgencyFilter } from '@/store/agencyFilter'

// Mock data
const mockMessages = [
  {
    id: '1',
    talentId: '1',
    talentName: 'Sarah Chen',
    subject: 'Campaign deliverables ready',
    preview: 'Hi! I\'ve completed the first set of photos for the summer campaign...',
    timestamp: '2 hours ago',
    unread: true
  },
  {
    id: '2',
    talentId: '2',
    talentName: 'Marcus Johnson',
    subject: 'Question about video specs',
    preview: 'Quick question about the video resolution requirements...',
    timestamp: '1 day ago',
    unread: false
  },
  {
    id: '3',
    talentId: '3',
    talentName: 'Emma Rodriguez',
    subject: 'Available for new projects',
    preview: 'Just finished my current project and available for new work...',
    timestamp: '3 days ago',
    unread: false
  }
]

export default function Messages() {
  const { activeTalentId } = useAgencyFilter()
  const [messages] = useState(mockMessages)

  const filteredMessages = messages.filter((m)=>{
    if (!activeTalentId) return true
    return m.talentId === activeTalentId
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold">Inbox</h1>
        <button className="rounded-full bg-white/10 border border-white/10 px-4 py-2 hover:bg-white/15 transition text-sm">
          Compose
        </button>
      </div>

      <div className="space-y-2">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            No messages {activeTalentId ? 'from this talent' : 'found'}
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className={`rounded-xl ring-1 ring-white/10 p-4 hover:bg-white/3 transition cursor-pointer ${
              message.unread ? 'bg-white/5' : 'bg-white/2'
            }`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`font-medium ${message.unread ? 'text-white' : 'text-white/80'}`}>
                      {message.talentName}
                    </div>
                    {message.unread && (
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    )}
                  </div>
                  <div className={`text-sm mt-1 ${message.unread ? 'text-white/90' : 'text-white/60'}`}>
                    {message.subject}
                  </div>
                  <div className="text-sm text-white/50 mt-1 truncate">
                    {message.preview}
                  </div>
                </div>
                <div className="text-xs text-white/50">
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}







