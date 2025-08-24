'use client';

import { GlowCard } from '@/components/ui/GlowCard';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Search, Filter, MapPin, Clock, DollarSign } from 'lucide-react';

// Mock jobs data
const jobs = [
  {
    id: 1,
    title: 'Mobile App UI/UX Design',
    company: 'TechStart Inc',
    location: 'Remote',
    type: 'Contract',
    rate: '$85/hour',
    duration: '2-3 months',
    tags: ['UI/UX', 'Mobile', 'Figma'],
    postedDate: '2 days ago',
    urgent: false,
  },
  {
    id: 2,
    title: 'Brand Identity & Logo Design',
    company: 'Creative Studio',
    location: 'New York, NY',
    type: 'Project',
    rate: '$2,500 fixed',
    duration: '3-4 weeks',
    tags: ['Branding', 'Logo', 'Identity'],
    postedDate: '1 week ago',
    urgent: true,
  },
  {
    id: 3,
    title: 'E-commerce Website Development',
    company: 'Digital Agency',
    location: 'Remote',
    type: 'Contract',
    rate: '$95/hour',
    duration: '4-6 months',
    tags: ['React', 'E-commerce', 'Full-stack'],
    postedDate: '3 days ago',
    urgent: false,
  },
  {
    id: 4,
    title: 'Content Writing & SEO',
    company: 'Marketing Firm',
    location: 'Remote',
    type: 'Part-time',
    rate: '$45/hour',
    duration: 'Ongoing',
    tags: ['Content', 'SEO', 'Marketing'],
    postedDate: '5 days ago',
    urgent: false,
  },
];

export default function JobsPage() {
  return (
    <div className="container space-y-6 py-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="h1">Jobs</h1>
          <p className="body text-muted">Discover new opportunities</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <button className="px-4 py-3 bg-surface border border-border rounded-lg text-muted hover:text-text transition-colors">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Alert for new jobs */}
      <InlineAlert variant="info">
        4 new jobs match your skills and preferences
      </InlineAlert>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <GlowCard key={job.id} className="p-6 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="h3">{job.title}</h3>
                  <p className="body text-muted">{job.company}</p>
                </div>
                {job.urgent && (
                  <div className="bg-warn/10 text-warn px-2 py-1 rounded-full text-xs font-medium">
                    Urgent
                  </div>
                )}
              </div>
              
              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {job.duration}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.rate}
                </div>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-surface-2 text-text text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted">Posted {job.postedDate}</span>
              <button className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors">
                Apply Now
              </button>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Load more */}
      <div className="text-center">
        <button className="px-6 py-3 bg-surface border border-border text-text rounded-lg hover:bg-surface-2 transition-colors">
          Load More Jobs
        </button>
      </div>
    </div>
  );
}