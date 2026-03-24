# Creator Hive — AI Integration Strategy

## Current AI Touchpoints (Implemented)

### 1. AI-Powered Talent Discovery (HeroBar)
- **Where**: Search bar on welcome page
- **How**: Text queries sent to `/api/ai-search` → returns matched talent IDs + team summary
- **Behavior**: AI picks float to front of carousel with "AI pick" badge

### 2. Brief Upload for AI Matching (HeroBar +)
- **Where**: (+) button next to Discover
- **How**: User uploads brief/image/presentation → file name injected into search query
- **Status**: File reference only — needs server-side parsing to extract brief content

### 3. Campaign Performance AI Chat (TrackScreen)
- **Where**: Chat bar above the performance chart
- **How**: Text query + file upload → campaign context (name, objective, budget, talent, KPIs) sent to AI
- **Status**: Wired to `/api/ai-search` — needs dedicated `/api/ai-analyze` endpoint


## Recommended AI Additions (Priority Order)

### P1 — AI Brief Builder (Welcome Page)
**Where**: Triggered when user uploads via (+) or types a detailed campaign description
**How it works**:
1. User uploads a PDF/PPTX brief or types a paragraph
2. LLM extracts: objectives, target audience, deliverables, timeline, budget range, tone
3. Auto-populates the Campaign Setup Board fields
4. Suggests matching talent based on brief requirements
**Reference**: How Contra and Toptal handle brief intake — structured extraction from unstructured input
**Implementation**: New `/api/ai-brief-parse` endpoint using Claude API with structured JSON output

### P2 — AI Brief-to-Talent Matching
**Where**: After brief is parsed, before talent gallery opens
**How it works**:
1. Brief content becomes a semantic query
2. Embeddings compare brief against creator profiles (bio, portfolio tags, brand partners, niche)
3. Returns ranked talent with match scores and reasoning
4. AI summary explains: "Based on your Ramadan campaign brief targeting UAE Gen Z, here are 8 creators with proven halal F&B content..."
**Reference**: How LinkedIn Recruiter matches job descriptions to candidate profiles
**Implementation**: Extend `/api/ai-search` to accept parsed brief object, not just text query

### P3 — AI in Manage (Deliverable Intelligence)
**Where**: ManageScreen — per-talent cards and execution hub
**Features**:
- Auto-suggest deliverable timelines based on campaign dates and content type
- Flag at-risk milestones (e.g., "Reel due in 2 days, no draft uploaded")
- Draft feedback for creator submissions: "The reel hits brand tone but consider tighter pacing in the first 3 seconds"
- Suggest revision notes based on brief objectives
**Reference**: How Asana uses AI for task prioritization and Monday.com for workload balancing
**Implementation**: AI sidebar in Manage, similar to Track's chat bar


### P4 — AI Campaign Performance Analyst (Track)
**Where**: Already partially implemented — the chat bar on TrackScreen
**Enhancement needed**:
- Dedicated `/api/ai-analyze` endpoint that ingests full campaign data:
  - KPI history (4 weekly data points)
  - Creator-level breakdown (reach, ER, deliverables)
  - Budget spend vs plan
  - Benchmarks from similar campaigns
- Outputs: Performance insights, optimization recommendations, anomaly detection
- Accept screenshots of Instagram Insights, TikTok Analytics for OCR → data extraction
**Reference**: How Sprout Social and HypeAuditor surface automated campaign insights
**Implementation**: Extend the existing chat bar to stream responses, support multi-turn

### P5 — AI Contract & SOW Generation
**Where**: CampaignSetupBoard → after booking confirmation
**How it works**:
- AI generates customized SOW based on campaign brief, talent rates, deliverables
- Dynamic clause selection based on booking type (campaign vs retainer)
- Usage rights language auto-selected based on campaign objectives
- Rate negotiation suggestions based on market data
**Reference**: How Deel and Remote.com auto-generate contractor agreements
**Implementation**: Template-based generation with AI fill, building on existing `handleDownloadSOW`

### P6 — AI-Powered Pulse Feed (Hive Tab)
**Where**: The Hive/Pulse tab in bottom dock
**How it works**:
- AI curates daily feed of relevant market signals for the user's campaign type
- "TikTok Reels outperforming IG for F&B in UAE this week — consider shifting 20% budget"
- Trend alerts specific to the user's active campaigns and booked talent
- Creator spotlight recommendations based on trending content in the user's niche
**Reference**: How Bloomberg Terminal surfaces relevant news per portfolio; how TikTok Creative Center trends work
**Implementation**: Cron job that generates personalized feed items, stored per user


## How Top Marketplaces Use AI

| Platform | AI Feature | Creator Hive Equivalent |
|----------|-----------|------------------------|
| **Contra** | AI-generated project briefs from descriptions | P1 — AI Brief Builder |
| **Toptal** | AI matching algorithm (skills + availability + rate) | P2 — Brief-to-Talent Matching |
| **Fiverr** | AI-powered search with natural language | Already implemented (HeroBar AI search) |
| **Upwork** | AI job post optimizer + freelancer recommendations | P1 + P2 combined |
| **LinkedIn** | AI recruiter matching job descriptions to profiles | P2 — semantic matching with embeddings |
| **Sprout Social** | AI campaign performance summaries | P4 — Campaign Performance Analyst |
| **Notion AI** | In-context AI assistant for documents | P3 — AI in Manage for deliverable feedback |
| **Deel** | Auto-generated contracts with smart clauses | P5 — Contract & SOW Generation |
| **TikTok Creative Center** | Trend analysis and content suggestions | P6 — AI-Powered Pulse Feed |

## Technical Architecture

All AI features should use the same pattern:
1. **Client**: Sends structured request with context (campaign data, brief, files)
2. **API Route**: `/api/ai-*` endpoint validates, enriches with DB data
3. **LLM Call**: Claude API with structured system prompt + JSON output schema
4. **Response**: Streamed back to client for real-time display

Key decision: Use Claude API directly (already have GROK_API_KEY and can add Anthropic key) rather than building custom ML models. The structured output capability of Claude makes it ideal for all 6 features above.

## Implementation Priority

Week 1: P1 (Brief Builder) + P2 (Brief Matching) — highest user impact
Week 2: P4 (Campaign Analyst enhancement) + P3 (Manage AI)
Week 3: P5 (Contract AI) + P6 (Pulse Feed)
