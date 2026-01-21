import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../System/AuthContext';

export type ViewType =
  | 'home'
  | 'login'
  | 'dashboard'
  | 'the-repo'
  | 'schedule'
  | 'contacts'
  | 'map'
  | 'pitch'
  | 'pitch-list'
  | 'pitch-new'
  | 'portfolio'
  | 'analytics'
  | 'collaborate'
  | 'about'
  | 'about-rb'
  | 'about-process'
  | 'about-ai'
  | 'about-tools'
  | 'about-sources'
  | 'project-rb02'
  | 'project-rb02-blocks'
  | 'project-rb05'
  | 'project-rb08';

interface SubItem {
  label: string;
  view?: ViewType;
  href?: string;
}

interface NavSection {
  id: string;
  label: string;
  view: ViewType;
  subItems: (string | SubItem)[];
}

interface TopNavbarProps {
  onNavigate: (view: ViewType) => void;
  onLogoClick: () => void;
}

// Work items organized by year
const WORK_BY_YEAR = [
  {
    year: '2024',
    projects: [
      { id: 'X24-RB01', title: 'Immersive Learning' }
    ]
  },
  {
    year: '2025',
    projects: [
      { id: 'X25-RB01', title: 'Sanctuary Spaces' },
      { id: 'X25-RB02', title: 'Modulizer Part 2' },
      { id: 'X25-RB03', title: 'A4LE Design Awards' },
      { id: 'X25-RB05', title: 'Mass Timber' },
      { id: 'X25-RB06', title: 'Timberlyne Study' },
      { id: 'X25-RB08', title: 'Modulizer Part 1' },
      { id: 'X25-RB13', title: 'Modulizer Part 3' }
    ]
  },
  {
    year: '2026',
    projects: [
      { id: 'X26-RB03', title: 'Gyp Concrete' }
    ]
  }
];

const EXPLORE_ITEMS = [
  'Mass Timber',
  'Immersive Learning',
  'Sanctuary Spaces',
  'Modulizer Part 1'
];

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'campus',
    label: 'campus',
    view: 'map',
    subItems: ['austin', 'san antonio', 'dallas', 'houston', 'corpus christi']
  },
  {
    id: 'explore',
    label: 'explore',
    view: 'portfolio',
    subItems: [] // Special handling for this section
  },
  {
    id: 'pitch',
    label: 'pitch',
    view: 'pitch',
    subItems: [
      { label: "Let's Pitch!", view: 'pitch-new' },
      { label: 'My Pitches', view: 'pitch-list' }
    ]
  },
  {
    id: 'connect',
    label: 'connect',
    view: 'collaborate',
    subItems: [
      { label: 'research', view: 'collaborate' },
      { label: 'work', href: 'https://pflugerarchitects.com' }
    ]
  },
  {
    id: 'about',
    label: 'about',
    view: 'about',
    subItems: [
      { label: 'Research & Benchmarking', view: 'about-rb' },
      { label: 'Our Process', view: 'about-process' },
      { label: 'Our Tools', view: 'about-tools' },
      { label: 'Use of AI', view: 'about-ai' },
      { label: 'Sources & Citations', view: 'about-sources' }
    ]
  }
];

const REPO_SECTION: NavSection = {
  id: 'the-repo',
  label: 'repository',
  view: 'the-repo',
  subItems: [
    { label: 'Repository', view: 'the-repo' },
    'My Research',
    { label: 'Schedule', view: 'schedule' },
    { label: 'Contacts', view: 'contacts' }
  ]
};

export function TopNavbar({ onNavigate, onLogoClick }: TopNavbarProps) {
  const { logout, isAuthenticated, user } = useAuth();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Generate initials from user name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      onNavigate('login');
    }
  };

  const visibleSections = isAuthenticated
    ? [...NAV_SECTIONS.slice(0, 2), REPO_SECTION, ...NAV_SECTIONS.slice(2)]
    : NAV_SECTIONS.filter(s => s.id !== 'pitch' && s.id !== 'campus' && s.id !== 'explore');

  const isExpanded = hoveredId !== null;
  const activeSection = visibleSections.find(s => s.id === hoveredId);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Nav container */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-card"
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Main nav row */}
        <div className="px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
          >
            <svg
              viewBox="0 0 136 125"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-auto"
            >
              <path
                d="M88.4963 97.5264L61.8321 82.1318C60.2851 81.2386 59.3321 79.588 59.3321 77.8017V25.6603C59.3321 21.8112 63.4988 19.4056 66.8321 21.3301L93.4963 36.7247C95.0434 37.6179 95.9963 39.2685 95.9963 41.0549V93.1963C95.9963 97.0453 91.8297 99.4509 88.4963 97.5264Z"
                fill="#10101A"
                stroke="white"
                strokeWidth="10"
              />
              <path
                d="M70.1642 102.654L43.5 87.2593C41.953 86.3661 41 84.7155 41 82.9292V30.7878C41 26.9388 45.1667 24.5331 48.5 26.4576L75.1642 41.8522C76.7112 42.7454 77.6642 44.396 77.6642 46.1824V98.3238C77.6642 102.173 73.4976 104.578 70.1642 102.654Z"
                fill="#10101A"
                stroke="white"
                strokeWidth="10"
              />
            </svg>
            <span className="text-xl font-bold text-white tracking-wide">Repository</span>
          </button>

          {/* Nav items - centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
            {visibleSections.map((section) => (
              <button
                key={section.id}
                onClick={() => onNavigate(section.view)}
                onMouseEnter={() => setHoveredId(section.id)}
                className={`text-sm transition-colors py-2 ${
                  hoveredId === section.id ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Auth section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Profile card */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(user.name)}
                </div>
                {/* Name */}
                <span className="text-sm text-white font-medium">{user.name}</span>
              </div>
              {/* Logout button */}
              <button
                onClick={handleAuthClick}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title="Log in"
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mega menu dropdown */}
        <AnimatePresence>
          {isExpanded && activeSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-card"
            >
              <div className="px-12 py-8">
                {/* Special two-column layout for explore */}
                {activeSection.id === 'explore' ? (
                  <div className="flex gap-24">
                    {/* Left column - Explore items (big bold) */}
                    <div className="w-80">
                      <p className="text-xs text-gray-500 mb-4 tracking-wide">explore</p>
                      <div className="flex flex-col gap-1">
                        {EXPLORE_ITEMS.map((item, i) => (
                          <motion.button
                            key={item}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => onNavigate('portfolio')}
                            className="text-2xl font-bold text-white hover:text-gray-300 transition-colors text-left py-1"
                          >
                            {item}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Right column - Work by year */}
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-4 tracking-wide">work</p>
                      <div className="space-y-4">
                        {WORK_BY_YEAR.map((yearGroup, yi) => (
                          <motion.div
                            key={yearGroup.year}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: yi * 0.05 }}
                          >
                            <p className="text-sm text-gray-400 mb-1">{yearGroup.year}</p>
                            <div className="space-y-0.5 pl-3 border-l border-gray-700">
                              {yearGroup.projects.map((project) => (
                                <button
                                  key={project.id}
                                  onClick={() => onNavigate('portfolio')}
                                  className="block text-sm text-gray-400 hover:text-white transition-colors py-0.5"
                                >
                                  <span className="text-gray-600">{project.id}</span>
                                  <span className="mx-2">-</span>
                                  <span>{project.title}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Section title */}
                    <p className="text-xs text-gray-500 mb-4 tracking-wide">
                      {activeSection.label}
                    </p>

                    {/* Big bold items */}
                    <div className="flex flex-col gap-1">
                      {activeSection.subItems.map((item, i) => {
                        const isSubItem = typeof item === 'object';
                        const label = isSubItem ? item.label : item;
                        const targetView = isSubItem && item.view ? item.view : activeSection.view;
                        const href = isSubItem ? item.href : undefined;

                        if (href) {
                          return (
                            <motion.a
                              key={label}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="text-2xl font-bold text-white hover:text-gray-300 transition-colors text-left py-1"
                            >
                              {label}
                            </motion.a>
                          );
                        }

                        return (
                          <motion.button
                            key={label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => onNavigate(targetView)}
                            className="text-2xl font-bold text-white hover:text-gray-300 transition-colors text-left py-1"
                          >
                            {label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
