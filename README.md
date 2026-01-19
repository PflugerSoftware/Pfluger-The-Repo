# Repository - Research Platform

**Repository** is Pfluger Architects' Research & Benchmarking platform. It serves as both a public showcase of research work and an internal management tool for the R&B team.

## Handoff Notes (Jan 19, 2026)

**Latest Deploy:** https://pfluger-the-repo-67g.pages.dev

**What we built today:**

### Pitch System Overhaul
- **AI Pitch Assistant (Ezra)** - Conversational agent that helps users develop research pitches
  - Guides users from idea → scope → methodology → complete pitch
  - References existing research projects to build on prior work or find gaps
  - Uses `[PITCH_UPDATE: key="value"]` tags to lock in decisions and update UI
  - Progress sidebar shows pitch development steps in real-time

- **Pitch Review Dashboard** - Full reviewer interface for managing pitches
  - Left panel: Pitch list with status indicators
  - Right panel: Editable pitch details + comment thread
  - Combined scope + methodology dropdown (linked together)
  - Auto-calculated timeline based on 4 hours/week
  - Status controls: Pending → Revise → Green Lit
  - Inline commenting system

- **Research Methods (Scope + Methodology linked):**
  | Scope | Methodology | Hours | Timeline |
  |-------|-------------|-------|----------|
  | Simple | Infographic Creation | 20-60 | 5-15 weeks |
  | Simple | Expert Interview | 20-60 | 5-15 weeks |
  | Simple | Literature Review | 20-60 | 5-15 weeks |
  | Medium | Survey/Post-Occupancy | 60-120 | 15-30 weeks |
  | Medium | Annotated Bibliography | 60-120 | 15-30 weeks |
  | Complex | Case Study Analysis | 120-200 | 30-50 weeks |
  | Complex | Experimental Design | 120-200 | 30-50 weeks |
  | Complex | Long-form Whitepaper | 120-200 | 30-50 weeks |

### Authentication & Chat
- **Username-based login** - Changed from email to username (`software` / `123456Softwares!`)
- **Chat history persistence** - Conversations saved to Supabase `chat_sessions` table per user

### Files Changed
- `src/views/Pitch/PitchSubmission.tsx` - Complete rewrite with review dashboard
- `src/components/Pitch/PitchChatPanel.tsx` - Wired to pitch agent with UI updates
- `src/services/pitchAgent.ts` - New AI agent service for pitch development
- `src/services/chatHistory.ts` - New service for chat persistence
- `src/components/System/AuthContext.tsx` - Username-based auth
- `src/views/Login.tsx` - New login view

---

## Previous Notes (Jan 16, 2026)

**RAG improvements:**
- Section expansion: sections now act as entry points to their child content blocks
- Increased search limits: 25 blocks (was 10), 8 terms (was 5), 10 per term (was 5)
- Citations now use actual source IDs from project (e.g., `[12]` not renumbered to `[1]`)
- Only cited sources are returned (not all sources from blocks)

**Source coverage (content blocks only):**
| Project | Coverage |
|---------|----------|
| X24-RB01 | 96% |
| X25-RB01 | 78% |
| X25-RB02 | 67% |
| X25-RB03 | 100% |
| X25-RB05 | 100% |
| X25-RB06 | 88% |
| X25-RB08 | 100% |
| X25-RB13 | 95% |

---

## Overview

The platform serves two audiences:
- **Public Mode**: Showcase research portfolio to school districts, partners, and the public
- **Internal Mode**: Research management tools for Pfluger team members (login required)

## Technology Stack

- **React 18** with TypeScript
- **Vite** - Build tooling
- **Tailwind CSS v3** - Styling with custom dark theme
- **Mapbox GL JS** - 3D interactive mapping
- **Framer Motion** - Animations
- **Radix UI** - Accessible components
- **Supabase** - PostgreSQL database + Edge Functions + Auth + Storage
- **Claude AI** - Tiered RAG system (Haiku/Sonnet/Opus)
- **Cloudflare Pages** - Hosting and deployment

## Features

### Navigation

The app uses a centered top navigation bar with expandable mega-menu dropdowns:

- **Campus** - Interactive map of research projects by office location
- **Explore** - Portfolio of research work organized by year
- **Dashboard** (internal) - Project management, schedule, contacts
- **Pitch** (internal) - Submit and manage research proposals
- **Connect** - Contact form for partnership inquiries
- **About** - Information about the R&B department

### About Section

- **Research & Benchmarking** - Department overview and team
- **Our Process** - Six-step research methodology
- **Our Tools** - Software and custom tools used
- **Use of AI** - Transparency about AI in research
- **Sources & Citations** - APA formatting standards

### AI Research Assistant (Repository)

Conversational AI interface for exploring research findings:

**Tiered Model Architecture:**
- **Haiku** - Intent analysis, relevance checking, conversational responses
- **Sonnet** - Research synthesis with citations
- **Opus** - Deep analysis (reserved for complex queries)

**Features:**
- Full conversation history - understands context across messages
- Smart routing - determines if query needs research, clarification, or general knowledge
- Numbered citations with project attribution (e.g., `[12] X24-RB01 EyeClick...`)
- Web search fallback for topics outside our research
- Natural, conversational tone - not robotic Q&A

**Data Flow:**
1. User asks question
2. Haiku analyzes intent with conversation context
3. Search `project_blocks` table for relevant research (up to 25 blocks)
4. Haiku checks relevance of results (may pick section headers)
5. Section expansion: pull in child content blocks if section picked
6. Sonnet synthesizes answer with citations (uses actual source IDs)
7. Only cited sources returned for display

## RAG System Deep Dive

The AI research assistant uses a multi-phase approach designed for natural conversation, not robotic Q&A.

### Philosophy

Traditional RAG dumps everything it finds. Our approach:
- **Guide, don't dump** - One insight at a time, let users explore
- **Conversation, not search** - Understand context, remember what they said
- **Models shine** - No hardcoded responses, let the AI be natural

### Model Tiers

| Model | Role | When Used |
|-------|------|-----------|
| **Haiku** | Intent analysis, routing, clarification | Every query (fast, cheap) |
| **Sonnet** | Research synthesis with citations | When we have relevant research |
| **Opus** | Deep analysis, complex connections | Reserved for heavy lifting |

### Phase 0: Intent Analysis (Haiku)

Before searching, Haiku analyzes the query with full conversation context:

```
Analyze this conversation in the context of architectural design research.

Recent conversation:
user: ideas for a special needs school?
assistant: [previous response]
user: we have a new project, large site

Current message: "what about the site"

Our research covers: acoustics, lighting, daylight, color, biophilic design,
nature, emotional regulation, sanctuary spaces, child development,
learning environments, materials, sensory design

Respond with JSON:
{
  "topic": "main topic based on full conversation context",
  "intent": "research_query" | "conversational" | "general_design",
  "searchTerms": ["terms", "to", "search"],
  "relatedTopics": ["related topics from our list"],
  "contextSummary": "brief summary of what user is exploring"
}
```

**Intent types:**
- `research_query` - Question about design, or user sharing project context
- `conversational` - Greetings, thanks, very short replies needing clarification
- `general_design` - Design question likely outside our specific research

**Key insight**: "we have a new project, large site" is project context, not just a short reply. The prompt explicitly handles this.

### Phase 1: Relevance Check (Haiku)

After searching `project_blocks`, Haiku checks if results actually answer the question:

```
You are a research relevance checker. Given a user question and research
block summaries, determine which blocks are relevant.

User Question: "what about the site"

Research Blocks:
[{ id, summary, conclusions }...]

Respond with JSON:
{"relevant": true, "relevantBlockIds": ["id1"], "reasoning": "Brief explanation"}

Only include blocks that directly help answer the question.
```

If not relevant, we generate a clarifying response instead of forcing bad results.

### Phase 2: Conversational Response (Haiku)

When we need to clarify, redirect, or don't have research, Haiku generates a natural response:

```
You're a research assistant at Pfluger Architects chatting with someone
exploring design ideas. Respond naturally and helpfully.

Recent conversation:
[last 4 messages]

Their latest message: "not sure"

Context:
- They seem interested in: special needs school design
- Working on a new project with a large site
- Our research covers: [topics]
- Related topics we have: emotional regulation, sensory design
- We don't have specific research on their exact question

Respond conversationally (1-3 sentences). Acknowledge their interest and
gently steer toward topics we can help with, or offer general thoughts.
```

**No hardcoded fallbacks** - Every response is generated, maintaining natural voice.

### Phase 3: Research Synthesis (Sonnet)

When we have relevant research, Sonnet synthesizes with full conversation context:

```
You're chatting with someone exploring design research at Pfluger Architects.
Be genuinely curious and helpful - like a knowledgeable colleague, not a
search engine.

Conversation so far:
user: ideas for a special needs school?
assistant: [previous response]
user: we have a new project, large site
user: what about outdoor spaces?

Their current question: "what about outdoor spaces?"

VOICE:
- Natural, warm, curious
- Share what's interesting about what you found
- Make connections they might not have considered
- Reference earlier parts of the conversation if relevant

STRUCTURE (flexible, not rigid):
- Share one compelling insight from the research (cite using source ID like [12], [13])
- Mention the project naturally (X25-RB01)
- Connect to what they've shared about their project/interests
- Keep it conversational - 2-4 sentences total

AVOID:
- Bullet points, headers, lists
- "Based on research..." or "According to..."
- Ignoring context from the conversation
- Sounding like a report

Research Content:
[blocks with searchable_text, conclusions, source_ids]

Available Sources (use these exact IDs when citing):
[12] EyeClick. EyeClick Games Library
[13] Kids Jump Tech. Kids Jump Tech Products
```

### Voice & Tone Guidelines

**What we want:**
- Colleague sharing something interesting they found
- Curious about what the user is working on
- Makes connections they might not see
- Guides exploration, doesn't lecture

**What we avoid:**
- "Based on research..." / "According to studies..."
- Bullet point dumps
- Every response ending with a question
- Clinical, report-style language
- Ignoring what they've already told us

**Example good response:**
> That's interesting you're working on a large site - from the X25-RB01 sanctuary spaces research, one thing that stood out is how children's wayfinding changes dramatically with scale. Younger kids can feel genuinely lost in expansive spaces, which affects their sense of safety before they even get to the classroom [3]. Are you thinking about how to break down the scale, or is there flexibility in the site layout?

**Example bad response:**
> Based on our research, large sites present several considerations:
> - Wayfinding challenges for younger students
> - Scale can impact sense of safety
> - Outdoor spaces should be appropriately sized
>
> Would you like to know more about any of these topics?

### Citation System

1. Sonnet is given actual source IDs: `[12] EyeClick`, `[13] Kids Jump Tech`
2. Sonnet cites using those real IDs: `[12]`, `[13]`
3. After synthesis, we extract which IDs were cited
4. Filter sources to only those actually cited
5. Display shows: `[12] X24-RB01 EyeClick. EyeClick Games Library`

**Note:** Citation numbers now match the project's sources block, so `[12]` in the chat corresponds to source 12 on the project page.

### Conversation History

- Last 4 messages passed to intent analysis
- Last 6 messages passed to synthesis
- Enables understanding "the site" refers to earlier context
- Allows natural conversation flow without repeating context

### Web Search Fallback

When we don't have research on a topic:
1. Call `web-search` Edge Function
2. Sonnet generates general knowledge response
3. Gently nudge toward related topics we DO have

Edge Function uses Sonnet to answer general design questions, keeping the same conversational voice.

### Research Topics We Cover

The system knows our research areas for smart routing:
- Acoustics
- Lighting / Daylight
- Color psychology
- Biophilic design / Nature
- Emotional regulation
- Sanctuary spaces
- Child development
- Learning environments
- Materials
- Sensory design

Queries outside these areas get web search + redirection.

### Research Campus Map

- Floating glassmorphism sidebar
- Projects organized by office (Austin, Corpus Christi, etc.)
- Search functionality
- Project detail panel with dashboard links

### Team

- Alexander Wickes, RA, LEED BD+C - Design Performance Leader, Research
- Christian Owens, AIA - Director of Design
- Brenda Swirczynski, MSc, ALEP - Education Facilities Planner

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create `.env.local` with:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Anthropic (for local development - production uses Edge Function secrets)
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Supabase Edge Functions need `ANTHROPIC_API_KEY` set in the dashboard secrets.

### Build for Production

```bash
npm run build
```

### Deploy to Cloudflare Pages

```bash
npm run build && wrangler pages deploy dist --project-name=pfluger-the-repo
```

**URLs:**
- Production: `https://pfluger-the-repo-67g.pages.dev`
- Custom domain: `https://repository.pflugerarchitects.com` (pending DNS)

## Authentication

For internal team members, navigate to the Login page:
- Username: `software`
- Password: `123456Softwares!`

*Note: Hardcoded for development. Production will use Pfluger SSO (Microsoft Entra ID).*

## Project Structure

```
src/
├── components/
│   ├── Navigation/
│   │   └── TopNavbar.tsx           # Main navigation bar
│   ├── System/
│   │   ├── ThemeManager.tsx        # Theme colors & utilities
│   │   └── AuthContext.tsx         # Authentication state
│   ├── blocks/                     # Block system components
│   │   ├── BlockRenderer.tsx       # Renders blocks by type
│   │   ├── types.ts                # Block type definitions
│   │   └── *Block.tsx              # Individual block components
│   └── ui/                         # Radix UI components
├── views/
│   ├── Home.tsx                    # Landing page with carousel
│   ├── Campus/ResearchMap.tsx      # Interactive map
│   ├── Explore/Portfolio.tsx       # Research gallery by year
│   ├── Connect/Collaborate.tsx     # Contact page
│   ├── Repo/                       # Internal dashboard views
│   ├── About/                      # About section views
│   └── projects/
│       ├── ProjectDashboard.tsx        # Project detail overlay
│       └── DynamicProjectDashboard.tsx # Database-driven project loader
├── data/
│   ├── loadProjects.ts             # CSV data loader (legacy)
│   └── projects/
│       └── X00-block-showcase/     # Block demo project (only static config)
├── config/
│   ├── supabase.ts                 # Supabase client
│   └── storage.ts                  # Supabase Storage URL helper
├── services/
│   ├── rag.ts                      # RAG system (search, intent, synthesis)
│   ├── pitchAgent.ts               # AI pitch assistant (Ezra)
│   ├── chatHistory.ts              # Chat session persistence
│   └── projects.ts                 # Project config fetcher (database)
├── context/
│   └── ProjectsContext.tsx         # Global project state
supabase/
└── functions/
    ├── claude/index.ts             # Claude API proxy
    └── web-search/index.ts         # Web search fallback
public/
└── data/
    └── research_projects.csv       # Research project data
```

## Block System

Project dashboards use a composable block system. Blocks are stored in the Supabase `project_blocks` table and fetched dynamically when a project is opened.

**Architecture:**
- Project metadata (title, researcher, etc.) stored in `src/services/projects.ts`
- Block content stored in Supabase `project_blocks` table
- `DynamicProjectDashboard` fetches blocks on demand with loading state
- Images served from Supabase Storage bucket

**Database Stats (as of Jan 2026):**
- 182 blocks across 8 projects
- RAG-searchable with summary, tags, and searchable_text fields

### Available Blocks (21 types)

| Block | Purpose |
|-------|---------|
| `section` | Section divider with title and optional source refs |
| `text-content` | Markdown-like text with headers, bullets, bold |
| `stat-grid` | Grid of key metrics with trends |
| `key-findings` | Icon-based findings cards |
| `bar-chart` | Horizontal bars (simple, grouped, multi-bar) |
| `donut-chart` | Circular chart with center label |
| `comparison-table` | Side-by-side feature comparison |
| `image-gallery` | Responsive image grid with lightbox |
| `timeline` | Project timeline (horizontal/vertical) |
| `workflow-steps` | Process steps with findings/deliverables |
| `case-study-card` | Scrollable project cards with detail modals |
| `tool-comparison` | Rating rings with pros/cons |
| `scenario-bar-chart` | Cost scenario comparison |
| `cost-builder` | Interactive budget builder with toggles |
| `survey-rating` | 1-5 star rating distribution |
| `feedback-summary` | Positive/negative theme analysis |
| `quotes` | Testimonial cards |
| `activity-rings` | Apple-style concentric rings |
| `product-options` | Product lines with pricing/specs |
| `sources` | Citation list |

### Creating a Project Dashboard

1. Add project metadata to `src/services/projects.ts` in `PROJECT_METADATA`
2. Insert blocks into Supabase `project_blocks` table with:
   - `id`: Unique block ID (e.g., "section-overview")
   - `project_id`: Project ID (e.g., "X25-RB01")
   - `block_type`: One of the 21 block types
   - `block_order`: Sequential order (1, 2, 3...)
   - `data`: Block-specific JSON content
   - Optional RAG fields: `summary`, `tags`, `searchable_text`
3. Upload images to Supabase Storage bucket: `Repository Bucket/projects/[project-folder]/`
4. Add to `PROJECTS_WITH_DASHBOARDS` in Portfolio.tsx

### Block Showcase

View all blocks in action: Open the X00-DEMO project from the Portfolio page.

## Current Projects

### 2024
- **X24-RB01** - Immersive Learning (GPISD immersive technology research)

### 2025
- **X25-RB01** - Sanctuary Spaces (Psychology of sanctuary spaces in schools)
- **X25-RB02** - Modulizer Part 2 (Flour Bluff CTE design iterations)
- **X25-RB03** - A4LE Design Awards (Design award submissions)
- **X25-RB05** - Mass Timber (Psychological effects of timber in buildings)
- **X25-RB06** - Timberlyne Study (Mass timber design assist)
- **X25-RB08** - Modulizer Part 1 (Energy and massing strategies)
- **X25-RB13** - Modulizer Part 3 (Design concept survey analysis)

### 2026
- **X26-RB03** - Gyp Concrete (Material usage and life cycle impacts)

## Data Management

Research projects are stored in `/public/data/research_projects.csv`:

| Field | Description |
|-------|-------------|
| `id` | Project identifier (e.g., X25-RB01) |
| `title` | Project name |
| `researcher` | Lead researchers (comma-separated) |
| `category` | Research category |
| `phase` | Pre-Research, Developmental, or Completed |
| `description` | Project summary |
| `latitude` / `longitude` | Map coordinates |
| `partners` | Collaborating organizations (pipe-separated) |
| `startDate` / `completionDate` | Project timeline |
| `office` | Office location (Austin, Corpus Christi, etc.) |

## Theme & Design

The app uses an Apple-inspired dark theme with glassmorphism effects:

**Colors:**
- Background: `#181019` (deep purple)
- Cards: `#221a28`
- Borders: `#2d2435`

**Typography:**
- SF Pro system font stack

**UI Patterns:**
- Floating glassmorphism panels with backdrop blur
- White pill buttons for primary actions
- Minimal, clean layouts
- Smooth Framer Motion animations

## Research Categories

Each category has a dedicated color:
- **Psychology** - Brick Red `#9A3324`
- **Health & Safety** - Salmon `#f16555`
- **Sustainability** - Olive Green `#67823A`
- **Immersive Learning** - Sky Blue `#00A9E0`
- **Campus Life** - Chartreuse `#B5BD00`
- **Fine Arts** - Orange `#F2A900`

## Tools

### Software
- Custom Development (React, Python, D3.js, Mapbox, APIs)
- Revit
- Rhino + Grasshopper
- Enscape
- ArcGIS
- Qualtrics

### Custom Tools
- Repository (this platform)
- Modulizer
- POE Dashboard (in development)
- Region Intel (in development)

## Production Roadmap

### Critical Priority

- [ ] **SSO Authentication** - Replace hardcoded credentials with Pfluger SSO
  - Current: Hardcoded `apps@pflugerarchitects.com` / `123456` in `AuthContext.tsx`
  - Integrate Microsoft Entra ID (Azure AD) for Pfluger accounts
  - Add role-based permissions (Admin, Researcher, Viewer)
  - Session management and token refresh

- [x] **Database Schema (Supabase)** - Schema complete, project blocks migrated
  - 17 tables created with proper foreign keys and constraints
  - Supabase Auth integrated with users table
  - RLS policies configured
  - **182 project blocks migrated** to `project_blocks` table

- [x] **Project Blocks Database Integration**
  - Project dashboards fetch blocks from Supabase dynamically
  - `DynamicProjectDashboard` component with loading states
  - RAG system searches `project_blocks` for research queries
  - Images served from Supabase Storage

- [ ] **Remaining Frontend-Database Integration**
  - Connect pitch submission to `pitches` table
  - Connect collaboration form to `collaboration_requests` table
  - [x] Chat persistence wired to `chat_sessions` table (per username)

- [ ] **Form Backend & Notifications**
  - Collaborate form: Connect to Supabase + Resend for email notifications
  - Pitch submission: Store in Supabase, notify GreenLight team
  - Email templates for submission confirmations
  - Slack/Teams webhook for internal alerts

### High Priority

- [x] **Claude AI Integration** - RAG system implemented
  - Tiered model approach: Haiku (intent/routing) → Sonnet (synthesis) → Opus (deep analysis)
  - Full conversation history for context-aware responses
  - Smart intent routing (research query vs conversational vs general design)
  - Numbered citations with project attribution
  - Web search fallback via Supabase Edge Function
  - Files: `src/services/rag.ts`, `supabase/functions/claude/`, `supabase/functions/web-search/`

- [ ] **Asset Management**
  - Replace Unsplash placeholder images with real project photos
  - Files affected: `ImageCarousel.tsx`, `loadProjects.ts`, project configs
  - Set up Cloudflare R2 or similar for image hosting
  - Add image upload for project managers

- [ ] **OpenAsset Integration**
  - Connect to Pfluger's OpenAsset DAM
  - Pull project images automatically
  - Sync with project metadata

### Medium Priority

- [ ] **Audit Project Sources**
  - Verify all project configs have complete sources blocks
  - Check URLs are valid and not broken
  - Ensure APA formatting consistency
  - Add missing citations for referenced content

- [ ] **Data Tables & Grids**
  - Add sortable/filterable data tables for project lists
  - Export to CSV/Excel functionality
  - Bulk operations for project management

- [ ] **Real Hours Tracking**
  - Replace mock data in `Schedule.tsx` (lines 70-84)
  - Time entry interface for researchers
  - Integration with project management tools
  - Burndown charts and capacity planning

- [ ] **Pitch System Enhancements**
  - [x] AI pitch assistant (Ezra) for guided pitch development
  - [x] Pitch review dashboard with editable fields
  - [x] Combined scope + methodology with auto-calculated timeline
  - [ ] Replace hardcoded GreenLit topics with database
  - [ ] Replace DEFAULT_PITCHES mock data with database
  - [ ] Connect pitch submissions to Supabase `pitches` table
  - [ ] Email notifications for status changes

- [ ] **Analytics Dashboard**
  - Real metrics instead of placeholder stats
  - Research impact tracking
  - Publication and citation metrics
  - Partner engagement analytics

### Low Priority

- [ ] **Remove Demo Content**
  - Option to hide X00-DEMO from production
  - Environment-based feature flags
  - Separate dev/staging/prod configs

- [ ] **Production Logging**
  - Replace console.log/error with proper logging service
  - Error tracking (Sentry or similar)
  - Performance monitoring

- [ ] **PWA Features**
  - Offline support for field research
  - Push notifications for updates
  - Mobile-optimized views

## Supabase Schema

Database hosted on Supabase (PostgreSQL). Connection via Session Pooler for IPv4 compatibility.

### Tables (17)

| Table | Purpose |
|-------|---------|
| `users` | User accounts (linked to Supabase Auth) |
| `projects` | Research projects with full metadata |
| `research_projects` | Legacy map data (being consolidated) |
| `pitches` | Research pitch submissions |
| `pitch_comments` | Comments on pitches |
| `greenlit_topics` | Pre-approved research ideas |
| `chat_sessions` | AI chat session metadata |
| `chat_messages` | Chat message history |
| `contacts` | Partner/contact database |
| `contact_projects` | Many-to-many contacts/projects |
| `collaboration_requests` | Public contact form submissions |
| `calendar_events` | Project timeline events |
| `project_blocks` | Dashboard block content (182 blocks) |
| `project_partners` | Many-to-many projects/partners |
| `project_researchers` | Many-to-many projects/users |
| `project_sources` | Project citations |
| `project_updates` | Project activity log |

### Key Relationships

- `users.id` references `auth.users(id)` (Supabase Auth)
- `pitches.converted_to_project_id` references `projects(id)`
- `chat_messages.session_id` references `chat_sessions(id)`
- Normalized many-to-many tables for researchers, partners, sources

### project_blocks Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Block ID (e.g., "section-overview") |
| `project_id` | text | Project ID (e.g., "X25-RB01") |
| `block_type` | text | One of 21 block types |
| `block_order` | int | Display order (1, 2, 3...) |
| `data` | jsonb | Block-specific content |
| `summary` | text | RAG: Brief summary for search |
| `tags` | text[] | RAG: Searchable tags |
| `searchable_text` | text | RAG: Full-text search content |
| `conclusions` | text[] | RAG: Key takeaways |

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access |
| `researcher` | CRUD on own projects, pitches |
| `contributor` | Create pitches, view projects |
| `viewer` | Read-only access |

### Technical Debt

| File | Issue | Line(s) |
|------|-------|---------|
| `AuthContext.tsx` | Hardcoded credentials (username/password) | ~17-19, 40 |
| `Collaborate.tsx` | Simulated form submission | 16-31 |
| `PitchSubmission.tsx` | Hardcoded GreenLit topics | 79-117 |
| `PitchSubmission.tsx` | Mock DEFAULT_PITCHES data | 120-172 |
| `PitchSubmission.tsx` | "submittedBy" hardcoded to "You" | 297 |
| `Schedule.tsx` | Mock hours data | 70-84 |
| `loadProjects.ts` | Unsplash placeholders | 60-61, 81-91 |
| `ImageCarousel.tsx` | Unsplash hero images | 6, 12, 18, 24 |

## License

Proprietary - Pfluger Architects
