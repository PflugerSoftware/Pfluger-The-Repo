# EZRA Development Calendar

**Target Launch:** End of January 2026
**Tech Stack:** Supabase (PostgreSQL + Auth) - Approved
**Last Updated:** January 13, 2026

---

## Current Codebase State

| Area | Status | Notes |
|------|--------|-------|
| Block System (21 types) | ✅ Done | All components working |
| Project Dashboards (9) | ✅ Done | Configs complete |
| Research Map | ✅ Done | Mapbox 3D |
| Portfolio/Gallery | ✅ Done | Year grouping |
| Pitch UI | ✅ Done | Form, chat panel |
| TheRepo UI | ✅ Done | Chat interface |
| Auth | ⚠️ Mock | Hardcoded creds (Supabase Auth ready) |
| Database Schema | ✅ Done | 17 tables in Supabase |
| Frontend-DB Integration | ❌ None | Need to install @supabase/supabase-js |
| AI Integration | ❌ None | Pattern matching only |
| Persistence | ❌ None | State lost on refresh |

**UI is ~90% complete. Frontend-database integration is the priority.**

---

## Completed: Week 1 (January 5-9)

- [x] Tech stack decision meeting (1/8) - **Approved Supabase**
- [x] R&B Launch Planning meeting (1/9)
- [x] Supabase project created
- [x] Database schema designed and implemented (17 tables)
- [x] Supabase Auth configured
- [x] RLS policies set up

---

## Current: Week 2 (January 12-16)

### Monday 1/13 - Completed
- [x] Set up psql on local machine
- [x] Connected to Supabase via Session Pooler (IPv4)
- [x] Verified all 17 tables accessible
- [x] Updated documentation (README.md, this file)

### Remaining This Week

| Day | Task | Priority |
|-----|------|----------|
| Mon 1/13 | Install @supabase/supabase-js | Critical |
| Mon 1/13 | Create Supabase client config | Critical |
| Tue 1/14 | Connect auth to Supabase Auth | Critical |
| Tue 1/14 | Replace hardcoded login with real auth | Critical |
| Wed 1/15 | Load research_projects from Supabase | High |
| Wed 1/15 | Connect pitch submission to pitches table | High |
| Thu 1/16 | Connect collaboration form to collaboration_requests | High |
| Thu 1/16 | Set up Resend for email notifications | Medium |
| Fri 1/17 | Wire up chat persistence | Medium |

---

## Week 3: January 19-23

| Day | Task | Priority |
|-----|------|----------|
| Mon 1/20 | Claude API integration setup | High |
| Mon 1/20 | TheRepo.tsx real AI responses | High |
| Tue 1/21 | Claude RAG with project data | High |
| Tue 1/21 | PitchChatPanel.tsx AI integration | High |
| Wed 1/22 | GreenLit topics from Supabase | Medium |
| Wed 1/22 | MY_PITCHES from Supabase | Medium |
| Thu 1/23 | Real hours tracking (Schedule.tsx) | Medium |
| Thu 1/23 | Replace Unsplash placeholders | Medium |
| Fri 1/24 | Integration testing | Critical |
| Fri 1/24 | Bug fixes | Critical |

---

## Week 4: January 27-30

| Day | Task | Priority |
|-----|------|----------|
| Mon 1/27 | Final QA testing | Critical |
| Mon 1/27 | Production deployment prep | Critical |
| Tue 1/28 | Stakeholder demo | Critical |
| Tue 1/28 | Bug fixes from demo | High |
| Wed 1/29 | Production deployment | Critical |
| Thu 1/30 | **LAUNCH** | - |
| Thu 1/30 | Monitor + hotfixes | Critical |

---

---

## Pitch System Workflow (Detailed)

### Current State
The UI exists but everything is mock data:

| Component | File | Status |
|-----------|------|--------|
| Pitch submission form | `PitchSubmission.tsx` | ✅ UI done |
| AI chat builder | `PitchChatPanel.tsx` | ⚠️ Pattern-matching only (no real AI) |
| Pitch card (form) | `PitchCard.tsx` | ✅ UI done |
| GreenLit topics | `PitchSubmission.tsx:49-90` | ❌ Hardcoded |
| My Pitches list | `PitchSubmission.tsx:93-123` | ❌ Mock data |
| Submit action | `PitchSubmission.tsx:215-235` | ❌ console.log + alert() |
| Comment thread | `PitchSubmission.tsx:446-470` | ⚠️ UI only, no backend |

### Pitch Data Model (PitchCard.tsx:16-25)
```typescript
interface PitchData {
  researchIdea: string;
  alignment: 'current-project' | 'thought-leadership' | '';
  methodology: string;
  scopeTier: 'simple' | 'medium' | 'complex' | '';
  impact: string;
  resources: string;
  timeline: string;
  partners: string;
}
```

### Data Sources

**Legacy (CSV - being migrated):**
| File | Purpose |
|------|---------|
| `/public/data/research_projects.csv` | Project list for map/portfolio |
| `/public/data/district_attributes.csv` | District info |
| `/public/data/district_shapes.csv` | District geometry for map |

**Production (Supabase):**
All data will be served from Supabase PostgreSQL. CSV files retained for fallback.

---

### Supabase Schema (17 Tables - Implemented)

Connection: `postgresql://postgres.bydkzxqmgsvsnjtafphj:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres`

#### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts (Supabase Auth) | id (uuid), email, name, role, office |
| `projects` | Research projects | id (X26-RB01), title, category, phase, office |
| `research_projects` | Legacy map data | id, title, researcher, latitude, longitude |
| `pitches` | Pitch submissions | id, title, research_idea, status, submitted_by |
| `greenlit_topics` | Pre-approved ideas | id, title, description, category, suggested_scope |

#### Relationship Tables

| Table | Purpose |
|-------|---------|
| `project_researchers` | Many-to-many projects/users |
| `project_partners` | Many-to-many projects/partners |
| `project_sources` | Project citations |
| `project_blocks` | Dashboard block configs |
| `project_updates` | Activity log per project |
| `contact_projects` | Many-to-many contacts/projects |

#### Communication Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `chat_sessions` | AI chat sessions | id, user_id, session_type, context_id |
| `chat_messages` | Message history | id, session_id, role, content, metadata |
| `pitch_comments` | Comments on pitches | id, pitch_id, author_id, content |
| `collaboration_requests` | Public contact form | id, name, email, message, status |
| `contacts` | Partner database | id, name, organization, contact_type |
| `calendar_events` | Timeline events | id, title, event_type, event_date, project_id |

#### Roles (users.role)

| Role | Access |
|------|--------|
| `admin` | Full access to all data |
| `researcher` | CRUD own projects/pitches |
| `contributor` | Create pitches, view projects |
| `viewer` | Read-only |

#### Status Values

**pitches.status:** `pending` | `revise` | `greenlit` | `rejected` | `converted`

**projects.phase:** `Pre-Research` | `Developmental` | `Completed`

**collaboration_requests.status:** `new` | `reviewed` | `responded` | `archived`

---

### Status Flows

**GreenLit Topic:** `greenlit_available` → claim → `greenlit` → Project

**Custom Pitch:** `pending` → `greenlit` / `revise` / `rejected` → `converted`

**Project:** `Pre-Research` → `Developmental` → `Completed`

### Full Workflow: Pitch → Research → Live

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PITCH PHASE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐      ┌─────────┐      ┌────────┐                      │
│  │  DRAFT  │ ──▶  │ PENDING │ ──▶  │GREENLIT│ ─────────────────┐   │
│  └─────────┘      └────┬────┘      └────────┘                  │   │
│                        │                                        │   │
│                        ▼                                        │   │
│                   ┌─────────┐      ┌──────────┐                 │   │
│                   │ REVISE  │      │ REJECTED │                 │   │
│                   └────┬────┘      └──────────┘                 │   │
│                        │ resubmit                               │   │
│                        ▼                                        │   │
│                   ┌─────────┐                                   │   │
│                   │ PENDING │                                   │   │
│                   └─────────┘                                   │   │
└─────────────────────────────────────────────────────────────────┼───┘
                                                                  │
                    Agent creates Research Object + X26-RBxx      │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         RESEARCH PHASE                              │
│                      (appears on "My Research")                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐      ┌───────────┐      ┌────────┐      ┌──────────┐  │
│  │  DRAFT  │ ──▶  │IN PROGRESS│ ──▶  │ REVIEW │ ──▶  │ APPROVED │  │
│  └─────────┘      └───────────┘      └────┬───┘      └─────┬────┘  │
│       │                                   │                 │       │
│       │          User works with agent:   │                 │       │
│       │          • Upload metrics         │ revisions       │       │
│       │          • Add images             ▼                 │       │
│       │          • Build research.ts  ┌───────────┐         │       │
│       │          • Comments/chat      │IN PROGRESS│         │       │
│       │                               └───────────┘         │       │
│       │                                                     │       │
│       └── Agent scaffolds working document                  │       │
│                                                             │       │
└─────────────────────────────────────────────────────────────┼───────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           LIVE PHASE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Research Object becomes researchConfig.ts                          │
│  • Appears on Portfolio (Work)                                      │
│  • Appears on TheRepo                                               │
│  • Has project dashboard with blocks                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Projects Table (replaces research_objects concept)

In Supabase, greenlit pitches convert to `projects` table entries via `pitches.converted_to_project_id`.

**Related tables:**
- `project_researchers` - who's working on it
- `project_partners` - external collaborators
- `project_sources` - citations
- `project_blocks` - dashboard block configs
- `project_updates` - activity/comments

### Permissions Model

Uses Supabase RLS + `users.role`:

| Role | Pitches | Projects |
|------|---------|----------|
| `viewer` | None | Read-only |
| `contributor` | Own only | Read-only |
| `researcher` | Own only | Assigned projects |
| `admin` | All | All |

### "My Research" Page

**Shows:**
1. Research Objects where user is in `researchers` array
2. Status badge (draft/in_progress/review/approved)
3. Click to open research workspace

**Research Workspace:**
- Left: Chat with agent (builds config_data)
- Right: Live preview of blocks
- Bottom: Comments thread
- Actions: Upload images, add metrics, submit for review

### Agent Workflow (GreenLit → Research Object)

When pitch is GreenLit:
1. Agent creates new `research_objects` row
2. Agent scaffolds initial `config_data` from pitch:
   - Title, description from pitch
   - Suggested blocks based on methodology
   - Empty sections for user to fill
3. Assigns researchers (pitch submitter + any tagged)
4. Status = 'draft'
5. Appears on "My Research" page

### Pitch Workflow Implementation (Supabase)

**Tables ready:** `pitches`, `pitch_comments`, `greenlit_topics`

**Frontend tasks:**
- [ ] Connect PitchSubmission.tsx to Supabase `pitches` table
- [ ] Load greenlit_topics from Supabase (replace hardcoded)
- [ ] Load user's pitches from Supabase (replace MY_PITCHES mock)
- [ ] Wire up pitch_comments for comment threads
- [ ] Implement pitch status transitions

### Resolved Questions

1. **Who reviews pitches?** ✅
   - Reviewers = hardcoded list or Azure AD group
   - Reviewers see all pitches and research
   - Regular users see only their own

2. **What happens after "GreenLit"?** ✅
   - Agent auto-creates Research Object
   - Agent assigns project number (X26-RBxx)
   - Agent scaffolds initial config from pitch
   - Appears on "My Research" page

3. **Can users edit after submit?** ✅
   - Pitches: Only if status = 'revise'
   - Research: Always editable until status = 'approved'

4. **Comments system?** ✅
   - JSON array in the object itself
   - {user_name, user_id, message, timestamp}
   - Renders as chat thread UI

### Open Questions

1. **Notifications:** Email (Resend) vs in-app vs both?
2. **Image storage:** Supabase Storage vs OpenAsset integration?
3. **VP code integration:** Auto-generate or manual entry?

---

## Current Status (January 13, 2026)

### Completed
- [x] Tech stack decision - Supabase approved
- [x] Database schema design and implementation (17 tables)
- [x] Supabase Auth configuration
- [x] RLS policies setup
- [x] psql local connection established

### In Progress
- [ ] Install @supabase/supabase-js
- [ ] Create Supabase client config
- [ ] Documentation updates

### Next Up
- [ ] Connect frontend to Supabase Auth
- [ ] Replace CSV loading with Supabase queries
- [ ] Wire up pitch submission
- [ ] Wire up collaboration form
- [ ] Claude API integration

### Blocked By Other Decisions
| Task | Blocked By |
|------|------------|
| VP code integration | Decision #5 (LP, LF, JS) |
| Staff assignment features | Decision #5 communication chain |
| Public content | Decision #3 sign-off (CO, CC) |
| Marketing pipeline | Decision #3 (CO, CC) |

---

## Risk Assessment

**Current timeline:** 2.5 weeks to launch (Jan 30)

| Area | Risk | Mitigation |
|------|------|------------|
| Auth integration | Medium | Supabase Auth is ready, just need frontend |
| Claude API | Medium | Can launch with pattern matching, add AI later |
| Data migration | Low | CSV fallback available |
| SSO | High | May defer to post-launch |

**Fallback options:**
1. **Public-only launch** - No internal features, just showcase
2. **Phased launch** - Public first, internal features in February
3. **Demo mode** - Full UI with mock data, real backend in Q2

---

## Key Meetings This Month

| Date | Time | Meeting | Attendees | Status |
|------|------|---------|-----------|--------|
| Wed 1/8 | 1-2pm | Software & Infrastructure | CO, CM, LP, LF | Done - Supabase approved |
| Thu 1/9 | 11am-noon | R&B Launch Planning | CO | Done |
| Thu 1/9 | 3-4pm | Vision BD+I Dashboard | CC, DY, CO | Done |
| TBD | TBD | Project Prism | Terry, Tavo, AW | Pending |
| TBD | TBD | Turf Melting | CO, TS | Pending |

---

*Last updated: January 13, 2026*
