import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

import { ThemeProvider } from './components/System/ThemeManager';
import { AuthProvider, useAuth } from './components/System/AuthContext';
import { TopNavbar } from './components/Navigation/TopNavbar';
import type { ViewType } from './components/Navigation/TopNavbar';
import { logPageView } from './services/analytics';
import { getUserByEmail } from './services/pitchService';

import Home from './views/Home';
import Login from './views/Login';
import Dashboard from './views/Repo/Dashboard';
import TheRepo from './views/Repo/TheRepo';
import Schedule from './views/Repo/Schedule';
import Contacts from './views/Repo/Contacts';
import Analytics from './views/Repo/Analytics';
import ResearchMap from './views/Campus/ResearchMap';
import Portfolio from './views/Explore/Portfolio';
import PitchSubmission from './views/Pitch/PitchSubmission';
import Collaborate from './views/Connect/Collaborate';
import AboutRB from './views/About/AboutRB';
import AboutProcess from './views/About/AboutProcess';
import AboutAI from './views/About/AboutAI';
import AboutTools from './views/About/AboutTools';
import AboutSources from './views/About/AboutSources';
import { ProjectDashboard, DynamicProjectDashboard } from './views/projects';
import { showcaseConfig } from './data/projects/X00-block-showcase/project/showcaseConfig';

// Project overlay - stores project ID directly or null
type ProjectOverlay = string | null;

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [view, setView] = useState<ViewType>('home');
  const [previousView, setPreviousView] = useState<ViewType>('home');
  const [projectOverlay, setProjectOverlay] = useState<ProjectOverlay>(null);
  const [userUUID, setUserUUID] = useState<string | null>(null);

  // Load user UUID when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.username) {
      getUserByEmail(user.username).then(dbUser => {
        if (dbUser) {
          setUserUUID(dbUser.id);
        }
      });
    } else {
      setUserUUID(null);
    }
  }, [isAuthenticated, user?.username]);

  // Track page views when view changes
  useEffect(() => {
    if (userUUID && view) {
      logPageView(userUUID, view, previousView !== view ? previousView : null);
    }
  }, [view, userUUID]);

  const handleNavigate = (newView: ViewType) => {
    // Close project overlay when navigating away
    setProjectOverlay(null);
    setPreviousView(view);
    setView(newView);
  };

  const openProject = (projectId: string) => {
    setProjectOverlay(projectId);
  };

  const closeProject = () => {
    setProjectOverlay(null);
  };

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (projectOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [projectOverlay]);

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home onNavigate={() => {}} onOpenProject={openProject} />;
      case 'login':
        return <Login onSuccess={() => handleNavigate('home')} />;
      case 'dashboard':
        return <Dashboard onNavigate={(v) => handleNavigate(v as ViewType)} />;
      case 'the-repo':
        return <TheRepo onNavigate={(v) => handleNavigate(v as ViewType)} />;
      case 'schedule':
        return <Schedule />;
      case 'contacts':
        return <Contacts />;
      case 'map':
        return <ResearchMap onOpenProjectDashboard={openProject} />;
      case 'pitch':
        return <PitchSubmission />;
      case 'pitch-list':
        return <PitchSubmission initialViewMode="my-pitches" />;
      case 'pitch-new':
        return <PitchSubmission initialViewMode="new" />;
      case 'portfolio':
        return <Portfolio onOpenProjectDashboard={openProject} />;
      case 'analytics':
        return <Analytics />;
      case 'collaborate':
        return <Collaborate />;
      case 'about':
      case 'about-rb':
        return <AboutRB />;
      case 'about-process':
        return <AboutProcess />;
      case 'about-ai':
        return <AboutAI />;
      case 'about-tools':
        return <AboutTools />;
      case 'about-sources':
        return <AboutSources />;
      default:
        return <Home onNavigate={() => {}} />;
    }
  };

  const renderProjectOverlay = () => {
    if (!projectOverlay) return null;

    // X00-DEMO uses static config (showcase demo)
    if (projectOverlay === 'X00-DEMO') {
      return <ProjectDashboard config={showcaseConfig} onBack={closeProject} />;
    }

    // All other projects fetch from database
    return <DynamicProjectDashboard projectId={projectOverlay} onBack={closeProject} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar onNavigate={handleNavigate} onLogoClick={() => handleNavigate('home')} />

      <div className="h-20" />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Project Overlay */}
      <AnimatePresence>
        {projectOverlay && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeProject}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 overflow-hidden"
            >
              <div className="h-full bg-background/80 backdrop-blur-xl overflow-y-auto">
                {renderProjectOverlay()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
