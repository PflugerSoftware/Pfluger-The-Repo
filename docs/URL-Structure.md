# EZRA URL Structure

This document defines the URL routing structure for the EZRA platform.

**Last Updated:** January 28, 2026

---

## Public Routes

| URL | View | Description |
|-----|------|-------------|
| `/` | Home | Landing page |
| `/campus` | Research Campus | 3D interactive map of all projects |
| `/explore` | Explore | Gallery/portfolio of completed research |
| `/explore/:projectId` | Project Detail | Individual project dashboard (e.g., `/explore/X25-RB01`) |
| `/contact` | Contact | Partnership/collaboration contact form |
| `/about` | About R&B | Main about page |
| `/about/research&benchmarking` | About R&B | Research & Benchmarking overview |
| `/about/process` | About Process | Research process explanation |
| `/about/tools` | About Tools | Tools and methodologies |
| `/about/ai` | About AI | Ezra AI assistant information |
| `/about/sources` | About Sources | Citation and source information |

---

## Internal Routes (Login Required)

| URL | View | Description |
|-----|------|-------------|
| `/repository` | Repository | AI chat interface (Ezra) |
| `/repository/contacts` | Contacts | Partner database |
| `/repository/schedule` | Schedule | Project timeline |
| `/pitch` | Pitch | Main pitch view (browse greenlit + submit custom) |
| `/pitch/mypitches` | My Pitches | User's claimed/submitted pitches |

---

## Auth Routes

| URL | View | Description |
|-----|------|-------------|
| `/login` | Login | Authentication page |

---

## URL Patterns

### Project URLs
- Pattern: `/explore/:projectId`
- Examples:
  - `/explore/X25-RB01` - Sanctuary Spaces
  - `/explore/X25-RB02` - Another project
  - `/explore/X00-DEMO` - Showcase demo

### Nested Routes
- `/repository/*` - All repository-related features
- `/pitch/*` - All pitch-related features
- `/about/*` - All about pages
- `/explore/*` - All project exploration features

---

## Navigation Labels

Map old navigation labels to new URLs:

| Old Label | New Label | URL |
|-----------|-----------|-----|
| "Research Campus" | "Campus" | `/campus` |
| "Portfolio" | "Explore" | `/explore` |
| "Collaborate" | "Contact" | `/contact` |
| "The Repo" | "Repository" | `/repository` |
| "Submit Pitch" | "Pitch" | `/pitch` |

---

## Implementation Notes

- All internal routes (`/repository/*`, `/pitch/*`) require authentication
- Public routes are accessible without login
- Project routes (`/explore/:projectId`) are public but may have enhanced features when authenticated
- Route guards redirect unauthenticated users to `/login` when accessing internal routes
- 404 handling redirects to home page

---

## Migration from State-Based Navigation

Previously, navigation was managed through internal state (`view` state in App.tsx).

Now using React Router:
- URLs are shareable
- Browser back/forward buttons work
- Deep linking is supported
- Analytics can track page views by URL
