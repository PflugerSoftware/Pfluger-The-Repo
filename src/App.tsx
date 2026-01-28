import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

import { ThemeProvider } from './components/System/ThemeManager';
import { AuthProvider, useAuth } from './components/System/AuthContext';
import { ProtectedRoute } from './components/Router/ProtectedRoute';
import { TopNavbar } from './components/Navigation/TopNavbar';
import { logPageView } from './services/analytics';
import { getUserByEmail } from './services/pitchService';

import Home from './views/Home';
import Login from './views/Login';
import TheRepo from './views/Repo/TheRepo';
import Schedule from './views/Repo/Schedule';
import Contacts from './views/Repo/Contacts';
import ResearchMap from './views/Campus/ResearchMap';
import Portfolio from './views/Explore/Portfolio';
import PitchSubmission from './views/Pitch/PitchSubmission';
import Collaborate from './views/Contact/Collaborate';
import AboutRB from './views/About/AboutRB';
import AboutProcess from './views/About/AboutProcess';
import AboutAI from './views/About/AboutAI';
import AboutTools from './views/About/AboutTools';
import AboutSources from './views/About/AboutSources';
import { ProjectDashboard, DynamicProjectDashboard } from './views/projects';
import { showcaseConfig } from './data/projects/X00-block-showcase/project/showcaseConfig';

// Project overlay wrapper component
function ProjectOverlay() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  if (!projectId) {
    navigate('/');
    return null;
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={handleClose}
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
            {projectId === 'X00-DEMO' ? (
              <ProjectDashboard config={showcaseConfig} onBack={handleClose} />
            ) : (
              <DynamicProjectDashboard projectId={projectId} onBack={handleClose} />
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Track page views when location changes
  useEffect(() => {
    if (userUUID) {
      // Extract page name from pathname
      const pageName = location.pathname === '/' ? 'home' : location.pathname.slice(1).replace(/\//g, '-');
      logPageView(userUUID, pageName, null);
    }
  }, [location.pathname, userUUID]);

  // Lock body scroll when on project overlay routes
  useEffect(() => {
    const isProjectOverlay = location.pathname.startsWith('/explore/') && location.pathname !== '/explore';
    if (isProjectOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  // Handler for opening projects (navigates to /explore/:projectId)
  const openProject = (projectId: string) => {
    navigate(`/explore/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar onLogoClick={() => navigate('/')} />

      <div className="h-20" />

      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home onNavigate={() => {}} onOpenProject={openProject} />} />
          <Route path="/campus" element={<ResearchMap onOpenProjectDashboard={openProject} />} />
          <Route path="/explore" element={<Portfolio onOpenProjectDashboard={openProject} />} />
          <Route path="/contact" element={<Collaborate />} />
          <Route path="/login" element={<Login onSuccess={() => navigate('/')} />} />

          {/* About Routes */}
          <Route path="/about" element={<AboutRB />} />
          <Route path="/about/research&benchmarking" element={<AboutRB />} />
          <Route path="/about/process" element={<AboutProcess />} />
          <Route path="/about/tools" element={<AboutTools />} />
          <Route path="/about/ai" element={<AboutAI />} />
          <Route path="/about/sources" element={<AboutSources />} />

          {/* Internal Routes (Protected) */}
          <Route
            path="/repository"
            element={
              <ProtectedRoute>
                <TheRepo onNavigate={() => {}} onOpenProject={openProject} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repository/contacts"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repository/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pitch"
            element={
              <ProtectedRoute>
                <PitchSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pitch/mypitches"
            element={
              <ProtectedRoute>
                <PitchSubmission initialViewMode="my-pitches" />
              </ProtectedRoute>
            }
          />

          {/* Project Overlay Route */}
          <Route path="/explore/:projectId" element={<ProjectOverlay />} />

          {/* Fallback - redirect to home */}
          <Route path="*" element={<Home onNavigate={() => {}} onOpenProject={openProject} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
