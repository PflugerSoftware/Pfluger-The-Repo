# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Repository** is a dual-mode research platform for Pfluger Architects' Research & Benchmarking department. It serves as both a public showcase of research work and an internal management tool for the R&B team. The AI pitch assistant is named "Ezra".

**Technology Stack:**
- React 18 with TypeScript
- Vite build system
- Tailwind CSS v3 with Pfluger brand colors
- Mapbox GL JS for 3D interactive mapping
- Recharts for data visualization
- Framer Motion for animations
- Radix UI for accessible components
- PapaParse for CSV parsing

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on localhost:5173)
npm run dev

# Build for production
npm run build
```

## Application Architecture

### Dual-Mode System

The Repository operates in two modes controlled by authentication state:

**Public Mode (Default - No Login Required):**
- Research Campus (Map) - Interactive map of all projects
- Gallery - Showcase of completed research
- Collaborate - Contact form for partnerships

**Internal Mode (Pfluger Team Only - Login Required):**
- All public features PLUS:
- Research Hub - Dashboard with metrics
- Submit Pitch - Internal research proposal form
- Analytics - Detailed insights and KPIs

### Authentication Flow

Authentication is managed through `AuthContext.tsx`:
- Hardcoded credentials (development): `apps@pflugerarchitects.com` / `123456`
- State persisted to localStorage
- Login modal appears when clicking "Team Sign In" button
- Upon login, internal views appear in navigation
- "Collaborate" view hides when authenticated

### Data Architecture

**CSV-Based Data (Current Implementation):**
- All project data in `/public/data/research_projects.csv`
- Loaded via `loadProjects.ts` using PapaParse
- Global state managed through `ProjectsContext`
- Real-time updates via React Context

**CSV Structure:**
```csv
id,title,researcher,category,phase,description,latitude,longitude,partners,startDate,completionDate
X25-RB01,Sanctuary Spaces,"Katherine Wiley, Braden Haley, Alex Wickes",psychology,Completed,...
```

**Data Models:**
- `ResearchProject` interface (src/data/loadProjects.ts)
- `id`: Unique identifier (format: X25-RBxx)
- `title`: Project name
- `researcher`: Comma-separated researchers
- `category`: Research category (psychology, sustainability, etc.)
- `phase`: Pre-Research | Developmental | Completed
- `description`: Project summary
- `position`: [latitude, longitude] tuple
- `partners`: Pipe-separated organizations
- `startDate` / `completionDate`: Date strings

### Component Organization

**System/** - Core infrastructure
- `ThemeManager.tsx` - Pfluger brand colors and theme utilities
- `AuthContext.tsx` - Authentication state management
- `LoginModal.tsx` - Login UI component

**Views/** - Top-level page components
- `ResearchMap.tsx` - Main map view with Leaflet
- `Portfolio.tsx` - Gallery of completed projects
- `Collaborate.tsx` - Public contact form
- `Dashboard.tsx` - Internal hub (requires auth)
- `PitchSubmission.tsx` - Internal pitch form (requires auth)
- `Analytics.tsx` - Internal metrics (requires auth)

**Context/** - Global state
- `ProjectsContext.tsx` - Research projects state provider

**Data/** - Data loading
- `loadProjects.ts` - CSV parser and data transformer

### Key Design Patterns

**Theme System:**
All colors are centralized in `ThemeManager.tsx` to match Pfluger brand:
- `APP_COLORS` - Pfluger primary and secondary palette
- `RESEARCH_CATEGORY_COLORS` - Category-specific colors with icons
- `DARK_THEME` - Material Design dark theme (#121212)
- `getPhaseColor()` - Adjust brightness based on project phase
- `getResearchCategoryColor()` - Get category styling

**Research Categories:**
Each category has dedicated color and Lucide icon:
- Psychology: Brick Red (#9A3324), Brain icon
- Health & Safety: Salmon (#f16555), Heart icon
- Sustainability: Olive Green (#67823A), Sprout icon
- Immersive Learning: Sky Blue (#00A9E0), Monitor icon
- Campus Life: Chartreuse (#B5BD00), Home icon
- Fine Arts: Orange (#F2A900), Palette icon

**Map Markers:**
- Custom circular icons with category colors
- Lucide SVG icons embedded in markers
- 3D effect with inner drop shadows
- Consistent 36px size
- Confidential projects (RB09, RB10, RB11) use gray with lock icon

**Authentication Pattern:**
```typescript
// In App.tsx
const visibleNavigation = [
  ...publicNavigation.filter(item => !item.hideWhenAuth || !isAuthenticated),
  ...(isAuthenticated ? internalNavigation : [])
];
```

**CSV Data Loading:**
```typescript
// Projects loaded on mount via Context
const { projects, loading } = useProjects();

// Data transformation in loadProjects.ts
partners: row.partners.split('|').filter(p => p.trim())
position: [parseFloat(row.latitude), parseFloat(row.longitude)]
```

### Important File Paths

```
src/
├── App.tsx                              # Main app with navigation
├── main.tsx                             # Vite entry point
├── components/
│   ├── System/
│   │   ├── ThemeManager.tsx             # Theme colors & utilities
│   │   ├── AuthContext.tsx              # Auth state
│   │   └── LoginModal.tsx               # Login UI
│   └── ui/                              # Radix UI primitives
├── views/
│   ├── ResearchMap.tsx                  # Main map view
│   ├── Portfolio.tsx                    # Gallery
│   ├── Collaborate.tsx                  # Contact form
│   ├── Dashboard.tsx                    # Internal hub
│   ├── PitchSubmission.tsx              # Internal pitch
│   └── Analytics.tsx                    # Internal metrics
├── data/
│   └── loadProjects.ts                  # CSV loader
├── context/
│   └── ProjectsContext.tsx              # Global project state
└── styles/
    └── index.css                        # Global styles

public/
└── data/
    └── research_projects.csv            # Project data

tailwind.config.js                       # Pfluger brand colors
vite.config.ts                           # Vite configuration
```

### Map Integration

The Research Campus map (ResearchMap.tsx) uses Mapbox GL JS with:
- Mapbox Standard Night style with 3D buildings
- Mercator projection for fast loading
- Default Mapbox pin markers colored by category
- Smooth flyTo animations on marker/project click
- Search and filter functionality
- Interactive project list and detail panel

**3D Map Features:**
- Initial pitch: 30° for 3D perspective view
- Click zoom: 11 with 45° pitch for optimal project viewing
- Zoom range: 3 (min) to 18 (max)
- Built-in 3D building extrusions from Standard Night style
- Smooth 2-second flyTo animations
- Antialias enabled for smooth 3D rendering

**Map Configuration:**
- Mapbox access token stored in `src/config/mapbox.ts`
- Free tier: 50,000 map loads per month
- Default center: Austin, Texas (-97.7431, 30.2672)
- Projection: Mercator (disables globe for faster loading)
- POI labels and street names hidden for cleaner appearance

**Map Features:**
- Full-height left sidebar (80-width) with:
  - Search box for filtering by title/researcher
  - Category dropdown filter
  - Scrollable project list
  - Color-coded legend
- Project detail panel (96-width) slides in from left showing:
  - Project title, ID, researcher
  - Phase badge
  - Description
  - Timeline (start/completion dates)
  - Research partners
- Default Mapbox pin markers:
  - Colored by research category
  - Scale: 1 (full size)
  - Popups on hover with title and ID
  - Click to open detail panel and fly to location
- Confidential projects (RB09, RB10, RB11):
  - Gray markers (#666666)
  - Special styling in detail panel
  - Lock icon indicator

### Confidential Projects

Projects X25-RB09, X25-RB10, and X25-RB11 are marked confidential:
- Gray gradient background
- Dashed border
- Lock icon instead of category icon
- "CONFIDENTIAL" badge in lists
- Special styling in detail panels

### Color System

**Pfluger Brand Palette:**
```typescript
primary: {
  brick: '#9A3324',
  black: '#000000',
  mediumGray: '#707372',
  lightGray: '#C7C9C7',
  white: '#FFFFFF'
}

secondary: {
  darkBlue: '#003C71',
  skyBlue: '#00A9E0',      // Primary accent
  oliveGreen: '#67823A',
  chartreuse: '#B5BD00',
  orange: '#F2A900',
  salmon: '#f16555'
}
```

**Dark Theme:**
- Background: `#121212` (Material Design)
- Cards: `#1e1e1e`
- Borders: `#2a2a2a`
- Accent: Sky Blue `#00A9E0`

### Working with Authentication

To test both modes:
1. **Public Mode**: Visit app without logging in
2. **Internal Mode**: Click "Team Sign In" → Use `apps@pflugerarchitects.com` / `123456`

When implementing features:
- Use `useAuth()` hook to check `isAuthenticated`
- Mark internal-only nav items with `requiresAuth: true`
- Mark public-only items with `hideWhenAuth: true`
- Check auth state before rendering sensitive data

### CSV Data Updates

To add/modify research projects:
1. Edit `/public/data/research_projects.csv`
2. Follow existing format (pipe-separated for arrays)
3. Ensure latitude/longitude are valid coordinates
4. Use existing category values
5. Phase must be: Pre-Research, Developmental, or Completed

### Future Enhancements (Planned)

1. **Interactive Network Visualization**
   - Click project to show connections
   - Lines show shared researchers, partners, categories
   - "Show All Connections" toggle
   - Color-coded relationship types

2. **Backend Integration**
   - Replace CSV with API calls
   - Database storage for projects
   - Real authentication system
   - Admin panel for project management

3. **Advanced Analytics**
   - Research impact metrics
   - Publication tracking
   - Collaboration network graphs
   - Time-series visualizations

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing naming conventions
- Leverage ThemeManager for all colors (no hardcoded colors)
- Use Lucide icons consistently
- Prefer Framer Motion for animations

### Component Patterns
- Functional components with hooks
- Props interfaces defined with TypeScript
- Use React Context for global state
- Lazy load heavy components when needed

### Styling
- Tailwind utility classes preferred
- Use theme colors from ThemeManager
- Material Design dark theme principles
- Responsive design (mobile-first)

### Performance
- React.memo for expensive components
- useMemo/useCallback for optimization
- Lazy loading for routes
- Code splitting where appropriate

## Known Limitations

- Authentication is hardcoded (development only)
- No persistence - all data in CSV
- No file upload functionality
- Export features not implemented
- Project connections are currently hardcoded arrays (being reimplemented)

## Testing

Currently no automated tests. Manual testing checklist:
- [ ] Public mode displays correctly
- [ ] Login flow works
- [ ] Internal views appear after login
- [ ] Map loads projects correctly
- [ ] Filters work on map
- [ ] Gallery shows completed projects
- [ ] Collaborate form submits
- [ ] Sign out returns to public mode

## Contact

For questions about The Repository development, contact the Pfluger Architects Research & Benchmarking team.
