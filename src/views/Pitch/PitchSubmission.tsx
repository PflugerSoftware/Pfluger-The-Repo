import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Send,
  Clock,
  Edit3,
  Zap,
  Lightbulb,
  Sparkles,
  Check,
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  Target,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../components/System/AuthContext';
import { type PitchData } from '../../components/Pitch/PitchCard';
import { PitchChatPanel } from '../../components/Pitch/PitchChatPanel';
import { ScheduleCard } from '../../components/Pitch/ScheduleCard';
import type { ExtractedPitch } from '../../services/pitchAgent';
import {
  getPitches,
  createPitch,
  updatePitch,
  claimPitch,
  generatePitchId,
  getPitchComments,
  addPitchComment,
  getUserByEmail,
  type Pitch,
  type PitchComment,
  type PitchStatus,
  type User as DbUser
} from '../../services/pitchService';

// Types
type PitchPath = 'choice' | 'greenlit' | 'builder';

// Combined scope + methodology options (4 hours/week = timeline calculation)
const RESEARCH_METHODS = [
  // Simple (20-60 hours) → 5-15 weeks
  { value: 'simple|Infographic Creation', scope: 'simple', methodology: 'Infographic Creation', hours: [20, 60], weeks: [5, 15] },
  { value: 'simple|Expert Interview', scope: 'simple', methodology: 'Expert Interview', hours: [20, 60], weeks: [5, 15] },
  { value: 'simple|Literature Review', scope: 'simple', methodology: 'Literature Review', hours: [20, 60], weeks: [5, 15] },
  // Medium (60-120 hours) → 15-30 weeks
  { value: 'medium|Survey/Post-Occupancy Design', scope: 'medium', methodology: 'Survey/Post-Occupancy Design', hours: [60, 120], weeks: [15, 30] },
  { value: 'medium|Annotated Bibliography', scope: 'medium', methodology: 'Annotated Bibliography', hours: [60, 120], weeks: [15, 30] },
  // Complex (120+ hours) → 30+ weeks
  { value: 'complex|Case Study Analysis', scope: 'complex', methodology: 'Case Study Analysis', hours: [120, 200], weeks: [30, 50] },
  { value: 'complex|Experimental Design', scope: 'complex', methodology: 'Experimental Design', hours: [120, 200], weeks: [30, 50] },
  { value: 'complex|Long-form Whitepaper', scope: 'complex', methodology: 'Long-form Whitepaper', hours: [120, 200], weeks: [30, 50] },
];

// Helper to get method info from combined value
const getMethodInfo = (value: string) => RESEARCH_METHODS.find(m => m.value === value);

// Helper to format timeline from weeks
const formatTimeline = (weeks: [number, number]) => `${weeks[0]}-${weeks[1]} weeks`;

// Helper to calculate hours per week from scope and timeline
const calculateHoursPerWeek = (scope: string, timeline: string): number => {
  // Extract weeks from timeline (e.g., "5-15 weeks" or "8 weeks")
  const weeksMatch = timeline.match(/(\d+)(?:-(\d+))?\s*weeks?/i);
  if (!weeksMatch) return 4; // Default to 4 hrs/week if can't parse

  // Use average weeks if range, otherwise use the single value
  const minWeeks = parseInt(weeksMatch[1]);
  const maxWeeks = weeksMatch[2] ? parseInt(weeksMatch[2]) : minWeeks;
  const avgWeeks = (minWeeks + maxWeeks) / 2;

  // Get total hours for scope
  const methodInfo = RESEARCH_METHODS.find(m => m.scope === scope);
  if (!methodInfo) return 4; // Default if scope not found

  const avgHours = (methodInfo.hours[0] + methodInfo.hours[1]) / 2;

  // Calculate hours per week
  return Math.round(avgHours / avgWeeks);
};

// Scope labels for display
const SCOPE_LABELS: Record<string, { label: string; color: string }> = {
  simple: { label: 'Simple', color: 'text-green-400' },
  medium: { label: 'Medium', color: 'text-yellow-400' },
  complex: { label: 'Complex', color: 'text-red-400' },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-800', icon: Clock },
  revise: { label: 'Revise & Resubmit', color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-800', icon: Edit3 },
  greenlit: { label: 'Green Lit!', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-800', icon: Zap }
};

interface PitchSubmissionProps {
  initialViewMode?: 'my-pitches' | 'new';
}

const PitchSubmission: React.FC<PitchSubmissionProps> = ({ initialViewMode = 'new' }) => {
  // Auth context
  const { user: authUser } = useAuth();

  // View state
  const [viewMode, setViewMode] = useState<'my-pitches' | 'new'>(initialViewMode);
  const [pitchPath, setPitchPath] = useState<PitchPath>('choice');
  const [expandedPitch, setExpandedPitch] = useState<string | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current user (from database)
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);

  // Pitches from database
  const [myPitches, setMyPitches] = useState<Pitch[]>([]);
  const [availableGreenlit, setAvailableGreenlit] = useState<Pitch[]>([]);
  const [selectedGreenlitPitch, setSelectedGreenlitPitch] = useState<Pitch | null>(null);

  // Comments for expanded pitch
  const [pitchComments, setPitchComments] = useState<PitchComment[]>([]);
  const [commentInput, setCommentInput] = useState('');

  // Edit mode for pitch review
  const [isEditingPitch, setIsEditingPitch] = useState(false);

  // Track if pitch is ready for final review
  const [isPitchComplete, setIsPitchComplete] = useState(false);

  // Pitch data (for custom flow with Ezra)
  const [pitchData, setPitchData] = useState<PitchData>({
    researchIdea: '',
    alignment: '',
    projectName: '',
    buildingOff: '',
    methodology: '',
    scopeTier: '',
    impact: '',
    resources: '',
    timeline: '',
    partners: ''
  });

  // Load data on mount or when auth user changes
  useEffect(() => {
    async function loadData() {
      if (!authUser) return;

      setIsLoading(true);
      try {
        // Get current user from database
        const user = await getUserByEmail(authUser.username);
        setCurrentUser(user);

        if (user) {
          // Admin sees ALL pitches, Researcher sees only their own
          if (authUser.role === 'admin') {
            const allPitches = await getPitches();
            setMyPitches(allPitches);
          } else {
            const mine = await getPitches({ userId: user.id });
            setMyPitches(mine);
          }
        }

        // Load available greenlit pitches (unclaimed)
        const available = await getPitches({ status: 'greenlit', availableOnly: true });
        setAvailableGreenlit(available);
      } catch (err) {
        console.error('Error loading pitch data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [authUser]);

  // Load comments when expanded pitch changes
  useEffect(() => {
    async function loadComments() {
      if (expandedPitch) {
        const comments = await getPitchComments(expandedPitch);
        setPitchComments(comments);
      } else {
        setPitchComments([]);
      }
    }
    loadComments();
  }, [expandedPitch]);

  const handleStartCustom = () => {
    setPitchPath('builder');
    setSelectedGreenlitPitch(null);
    setIsPitchComplete(false);
    setPitchData({
      researchIdea: '',
      alignment: '',
      projectName: '',
      buildingOff: '',
      methodology: '',
      scopeTier: '',
      impact: '',
      resources: '',
      timeline: '',
      partners: ''
    });
  };

  const handleStartGreenLit = () => {
    setPitchPath('greenlit');
    setSelectedGreenlitPitch(null);
    setIsPitchComplete(false);
  };

  const handleSelectGreenlitPitch = (pitch: Pitch) => {
    setSelectedGreenlitPitch(pitch);
  };

  const handleClaimGreenlit = async () => {
    if (!selectedGreenlitPitch || !currentUser) return;

    setIsSubmitting(true);
    try {
      // Claim the pitch (assign user_id)
      const success = await claimPitch(selectedGreenlitPitch.id, currentUser.id);
      if (success) {
        // Move from available to my pitches
        setAvailableGreenlit(prev => prev.filter(p => p.id !== selectedGreenlitPitch.id));
        setMyPitches(prev => [{ ...selectedGreenlitPitch, userId: currentUser.id }, ...prev]);

        // Reset and go to My Pitches
        setViewMode('my-pitches');
        setPitchPath('choice');
        setSelectedGreenlitPitch(null);
        setExpandedPitch(selectedGreenlitPitch.id);
      }
    } catch (err) {
      console.error('Error claiming pitch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (pitchPath === 'builder' || pitchPath === 'greenlit') {
      setPitchPath('choice');
      setSelectedGreenlitPitch(null);
    } else if (pitchPath === 'choice') {
      setViewMode('my-pitches');
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      // Generate a new pitch ID
      const newId = await generatePitchId();

      // Extract a title from the research idea
      const titleMatch = pitchData.researchIdea.match(/^[^.!?]+/);
      const title = titleMatch
        ? titleMatch[0].slice(0, 60) + (titleMatch[0].length > 60 ? '...' : '')
        : pitchData.researchIdea.slice(0, 60) + '...';

      // Create the pitch in database
      const newPitch = await createPitch({
        id: newId,
        userId: currentUser.id,
        title,
        researchIdea: pitchData.researchIdea,
        status: 'pending',
        alignment: pitchData.alignment || undefined,
        projectName: pitchData.projectName || undefined,
        buildingOff: pitchData.buildingOff || undefined,
        partner: pitchData.partners || undefined,
        methodology: pitchData.methodology || undefined,
        scopeTier: pitchData.scopeTier || undefined,
        impact: pitchData.impact || undefined,
        timeline: pitchData.timeline || undefined
      });

      if (newPitch) {
        // Add to my pitches
        setMyPitches(prev => [newPitch, ...prev]);

        // Reset and navigate to My Pitches
        setViewMode('my-pitches');
        setPitchPath('choice');
        setSelectedGreenlitPitch(null);
        setIsPitchComplete(false);
        setExpandedPitch(newPitch.id);
        setPitchData({
          researchIdea: '',
          alignment: '',
          projectName: '',
          buildingOff: '',
          methodology: '',
          scopeTier: '',
          impact: '',
          resources: '',
          timeline: '',
          partners: ''
        });
      }
    } catch (err) {
      console.error('Error submitting pitch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for pitch updates from the AI agent
  const handlePitchUpdate = (extracted: ExtractedPitch) => {
    setPitchData(prev => {
      const updates: Partial<PitchData> = {};

      if (extracted.researchIdea) {
        updates.researchIdea = extracted.researchIdea;
      }
      if (extracted.scope) {
        updates.scopeTier = extracted.scope;
      }
      if (extracted.methodology) {
        updates.methodology = extracted.methodology;
      }
      if (extracted.projectConnection) {
        // Map agent values to PitchData alignment type
        const alignment = extracted.projectConnection.toLowerCase();
        if (alignment === 'current-project' || alignment === 'prospected-project' || alignment === 'thought-leadership') {
          updates.alignment = alignment;
        }
      }
      if (extracted.projectName) {
        updates.projectName = extracted.projectName;
      }
      if (extracted.buildingOff) {
        updates.buildingOff = extracted.buildingOff;
      }
      if (extracted.partner) {
        updates.partners = extracted.partner;
      }
      if (extracted.successMetrics) {
        updates.impact = extracted.successMetrics;
      }
      if (extracted.timeline) {
        updates.timeline = extracted.timeline;
      }

      return { ...prev, ...updates };
    });

    // Check if pitch is marked complete by the agent
    if (extracted.isComplete) {
      setIsPitchComplete(true);
    }
  };

  // Handler to update a submitted pitch field (for reviewers)
  const handleUpdatePitchField = async (pitchId: string, field: string, value: string) => {
    // Update locally first for immediate feedback
    setMyPitches(prev => prev.map(p =>
      p.id === pitchId ? { ...p, [field]: value } : p
    ));

    // Then persist to database
    const dbField = field === 'researchIdea' ? 'researchIdea' :
                    field === 'scopeTier' ? 'scopeTier' : field;
    await updatePitch(pitchId, { [dbField]: value });
  };

  // Handler to change research method (combined scope + methodology + auto timeline)
  const handleMethodChange = async (pitchId: string, combinedValue: string) => {
    const methodInfo = getMethodInfo(combinedValue);

    const updates = methodInfo
      ? {
          scopeTier: methodInfo.scope,
          methodology: methodInfo.methodology,
          timeline: formatTimeline(methodInfo.weeks as [number, number])
        }
      : { scopeTier: '', methodology: '', timeline: '' };

    // Update locally
    setMyPitches(prev => prev.map(p =>
      p.id === pitchId ? { ...p, ...updates } : p
    ));

    // Persist to database
    await updatePitch(pitchId, updates);
  };

  // Handler to change pitch status
  const handleStatusChange = async (pitchId: string, newStatus: PitchStatus) => {
    // Update locally
    setMyPitches(prev => prev.map(p =>
      p.id === pitchId ? { ...p, status: newStatus } : p
    ));

    // Persist to database
    await updatePitch(pitchId, { status: newStatus });
  };

  // Handler to add a comment to a pitch
  const handleAddComment = async (pitchId: string) => {
    if (!commentInput.trim() || !currentUser) return;

    const newComment = await addPitchComment(pitchId, currentUser.id, commentInput);
    if (newComment) {
      setPitchComments(prev => [...prev, newComment]);
    }
    setCommentInput('');
  };

  // Render initial choice screen
  const renderChoiceScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-white mb-3">How would you like to pitch?</h2>
        <p className="text-gray-400">Choose a path that fits your research idea</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* GreenLit Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartGreenLit}
          className="bg-card border border-card rounded-xl p-8 text-left hover:border-green-800 transition-all group"
        >
          <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-900/70 transition-colors">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Choose a GreenLit Topic</h3>
          <p className="text-gray-400 text-sm mb-4">
            Select from pre-approved research topics already worked out by the R&B team.
          </p>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Fast-track approval</span>
          </div>
        </motion.button>

        {/* Custom Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartCustom}
          className="bg-card border border-card rounded-xl p-8 text-left hover:border-gray-600 transition-all group"
        >
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-gray-700 transition-colors">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pitch Your Own Idea</h3>
          <p className="text-gray-400 text-sm mb-4">
            Have a unique research idea? Build your pitch through conversation with AI.
          </p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>AI-assisted development</span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );

  // Render GreenLit pitch list (left panel)
  const renderGreenLitList = () => (
    <div className="bg-card border border-card rounded-2xl h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 shrink-0">
        <h2 className="text-lg font-bold text-white">Available GreenLit Pitches</h2>
        <p className="text-sm text-gray-500">Select a pre-approved pitch to claim</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {availableGreenlit.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No available greenlit pitches at the moment.
          </p>
        ) : (
          availableGreenlit.map((pitch) => {
            const isSelected = selectedGreenlitPitch?.id === pitch.id;
            return (
              <button
                key={pitch.id}
                onClick={() => handleSelectGreenlitPitch(pitch)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-green-900/30 border border-green-700'
                    : 'bg-gray-800/50 border border-transparent hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500">{pitch.id}</span>
                  {pitch.scopeTier && (
                    <>
                      <span className="text-xs text-gray-600">-</span>
                      <span className="text-xs text-gray-400 capitalize">{pitch.scopeTier}</span>
                    </>
                  )}
                  {isSelected && (
                    <Check className="w-4 h-4 text-green-400 ml-auto" />
                  )}
                </div>
                <h3 className={`font-medium mb-1 ${isSelected ? 'text-green-400' : 'text-white'}`}>
                  {pitch.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{pitch.researchIdea}</p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // Progress steps for pitch development
  const PITCH_STEPS = [
    { id: 'idea', label: 'Research Idea', description: 'What do you want to explore?' },
    { id: 'goal', label: 'Goal & Outcome', description: 'What will you create?' },
    { id: 'scope', label: 'Scope & Method', description: 'How will you approach it?' },
    { id: 'details', label: 'Timeline & Partners', description: 'When and with whom?' },
    { id: 'submit', label: 'Submit', description: 'Ready for review' },
  ];

  // Determine current step based on pitchData (simplified logic)
  const getCurrentStep = () => {
    if (!pitchData.researchIdea) return 0;
    if (!pitchData.alignment) return 1;
    if (!pitchData.methodology) return 2;
    if (!pitchData.timeline) return 3;
    return 4;
  };

  // Render progress sidebar
  const renderProgressSidebar = () => {
    const currentStep = getCurrentStep();

    return (
      <div className="bg-card border border-card rounded-2xl p-4 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-white mb-4">Pitch Progress</h3>

        <div className="space-y-3 flex-1">
          {PITCH_STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                  isComplete ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-sky-500 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {isComplete ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isComplete || isCurrent ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <ScheduleCard
            proposedScope={pitchData.scopeTier as 'simple' | 'medium' | 'complex' | ''}
            hoursPerWeek={pitchData.scopeTier && pitchData.timeline ? calculateHoursPerWeek(pitchData.scopeTier, pitchData.timeline) : undefined}
          />
        </div>
      </div>
    );
  };

  // Render final review panel when pitch is complete
  const renderFinalReview = () => {
    const scopeHours = {
      simple: '20-60',
      medium: '60-120',
      complex: '120+'
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-card rounded-2xl h-full flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-green-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Pitch Ready for Review</h2>
              <p className="text-sm text-gray-400">Review your pitch before submitting</p>
            </div>
          </div>
        </div>

        {/* Pitch Summary */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Research Question */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Research Question</h3>
            <p className="text-white">{pitchData.researchIdea || 'Not specified'}</p>
          </div>

          {/* Scope & Methodology */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Scope</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  pitchData.scopeTier === 'simple' ? 'bg-green-900/50 text-green-400' :
                  pitchData.scopeTier === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                  pitchData.scopeTier === 'complex' ? 'bg-red-900/50 text-red-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {pitchData.scopeTier || 'Not set'}
                </span>
                {pitchData.scopeTier && (
                  <span className="text-xs text-gray-500">
                    ({scopeHours[pitchData.scopeTier as keyof typeof scopeHours]} hours)
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Methodology</h3>
              <p className="text-white text-sm">{pitchData.methodology || 'Not specified'}</p>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Connection</h3>
            <p className="text-white text-sm capitalize">
              {pitchData.alignment === 'current-project' ? 'Connected to Current Project' :
               pitchData.alignment === 'prospected-project' ? 'Prospected Project (Future/Potential)' :
               pitchData.alignment === 'thought-leadership' ? 'Thought Leadership / General Research' :
               'Not specified'}
            </p>
          </div>

          {/* Project Name (conditional) */}
          {pitchData.projectName && (pitchData.alignment === 'current-project' || pitchData.alignment === 'prospected-project') && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Name/Number</h3>
              <p className="text-white text-sm">{pitchData.projectName}</p>
            </div>
          )}

          {/* Building Off */}
          {pitchData.buildingOff && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Building Off</h3>
              <p className="text-white text-sm">{pitchData.buildingOff}</p>
            </div>
          )}

          {/* Partner */}
          {pitchData.partners && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Partner/Organization</h3>
              <p className="text-white text-sm">{pitchData.partners}</p>
            </div>
          )}

          {/* Timeline */}
          {pitchData.timeline && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timeline</h3>
              <p className="text-white text-sm">{pitchData.timeline}</p>
            </div>
          )}

          {/* Impact */}
          {pitchData.impact && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expected Impact</h3>
              <p className="text-white text-sm">{pitchData.impact}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-800 space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-green-600 text-white hover:bg-green-500 transition-all"
          >
            <Send className="w-4 h-4" />
            Submit Pitch
          </motion.button>
          <button
            onClick={() => setIsPitchComplete(false)}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Continue editing
          </button>
        </div>
      </motion.div>
    );
  };

  // Render the pitch builder (unified layout for both GreenLit and Custom)
  const renderPitchBuilder = () => {
    const isGreenLitFlow = pitchPath === 'greenlit';

    // Custom flow: chat + progress sidebar OR final review
    if (!isGreenLitFlow) {
      // Show final review when pitch is complete
      if (isPitchComplete) {
        return (
          <div className="flex gap-6 max-w-3xl mx-auto">
            <div className="flex-1 min-w-0">
              {renderFinalReview()}
            </div>
          </div>
        );
      }

      // Show chat + progress sidebar during development
      return (
        <div className="flex gap-6">
          {/* Left: Chat Panel */}
          <div className="flex-1 min-w-0">
            <PitchChatPanel onPitchUpdate={handlePitchUpdate} />
          </div>

          {/* Right: Progress Sidebar */}
          <div className="w-72 shrink-0 h-full">
            {renderProgressSidebar()}
          </div>
        </div>
      );
    }

    // GreenLit flow: pitch list + details
    return (
      <div className="flex gap-6">
        {/* Left: GreenLit List */}
        <div className="flex-1 min-w-0 h-full">
          {renderGreenLitList()}
        </div>

        {/* Right: Selected pitch details + Claim button */}
        <div className="w-96 shrink-0 flex flex-col gap-4 h-full overflow-hidden">
          {selectedGreenlitPitch ? (
            <>
              <div className="bg-card border border-card rounded-2xl p-6 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                    Pre-Approved
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{selectedGreenlitPitch.title}</h2>
                <p className="text-sm text-gray-400 mb-6">{selectedGreenlitPitch.researchIdea}</p>

                <div className="space-y-4">
                  {selectedGreenlitPitch.scopeTier && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Scope</span>
                      <p className="text-white capitalize">{selectedGreenlitPitch.scopeTier}</p>
                    </div>
                  )}
                  {selectedGreenlitPitch.methodology && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Methodology</span>
                      <p className="text-white">{selectedGreenlitPitch.methodology}</p>
                    </div>
                  )}
                  {selectedGreenlitPitch.alignment && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Alignment</span>
                      <p className="text-white capitalize">{selectedGreenlitPitch.alignment.replace('-', ' ')}</p>
                    </div>
                  )}
                </div>
              </div>

              <ScheduleCard
                proposedScope={selectedGreenlitPitch.scopeTier as 'simple' | 'medium' | 'complex' | ''}
                hoursPerWeek={selectedGreenlitPitch.scopeTier && selectedGreenlitPitch.timeline ? calculateHoursPerWeek(selectedGreenlitPitch.scopeTier, selectedGreenlitPitch.timeline) : undefined}
              />

              {/* Claim Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaimGreenlit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-green-600 text-white hover:bg-green-500 transition-all shrink-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Claim This Pitch
              </motion.button>
            </>
          ) : (
            <div className="bg-card border border-card rounded-2xl p-6 flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a pitch to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render My Pitches view with full review panel
  const renderMyPitches = () => (
    <div className="flex gap-6">
      {/* Left: Pitch List */}
      <div className="w-80 shrink-0 space-y-2">
        {myPitches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No pitches yet.</p>
            <p className="text-sm mt-1">Create a new pitch to get started.</p>
          </div>
        ) : (
          myPitches.map((pitch, index) => {
            const isSelected = expandedPitch === pitch.id;
            const status = STATUS_CONFIG[pitch.status];
            const StatusIcon = status.icon;

            return (
              <motion.button
                key={pitch.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setExpandedPitch(isSelected ? null : pitch.id)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-card border-2 border-sky-500'
                    : 'bg-card border border-card hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-500">{pitch.id}</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.bg}`}>
                    <StatusIcon className={`w-3 h-3 ${status.color}`} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">{pitch.title}</h3>
                <div className="space-y-1">
                  {pitch.userName && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <User className="w-3 h-3" />
                      <span>{pitch.userName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{pitch.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Right: Review Panel */}
      <div className="flex-1 min-w-0">
        {expandedPitch ? (
          (() => {
            const pitch = myPitches.find(p => p.id === expandedPitch);
            if (!pitch) return null;
            const status = STATUS_CONFIG[pitch.status];
            const StatusIcon = status.icon;
            const methodInfo = pitch.scopeTier && pitch.methodology
              ? RESEARCH_METHODS.find(m => m.scope === pitch.scopeTier && m.methodology === pitch.methodology)
              : null;
            const scopeLabel = pitch.scopeTier ? SCOPE_LABELS[pitch.scopeTier] : null;
            const isMyComment = (comment: PitchComment) => comment.userId === currentUser?.id;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-card rounded-2xl"
              >
                {/* Content - Horizontal Layout: Hero Card + Chat */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left: Hero Card with all pitch info */}
                    <div className="flex flex-col min-w-0">
                      {methodInfo && scopeLabel ? (
                        <div className={`flex flex-col rounded-2xl border ${
                          pitch.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800' :
                          pitch.status === 'revise' ? 'bg-blue-900/20 border-blue-800' :
                          pitch.status === 'greenlit' ? 'bg-green-900/20 border-green-800' :
                          'bg-gray-900/20 border-gray-800'
                        }`}>
                          {/* Hero Header */}
                          <div className="p-6 border-b border-gray-800/50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                {/* Title */}
                                <h2 className="text-2xl font-bold text-white mb-3">{pitch.title}</h2>

                                {/* Metadata Row */}
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="font-mono text-gray-400">{pitch.id}</span>
                                  <span className="text-gray-600">•</span>

                                  {/* Status Badge / Picker */}
                                  {isEditingPitch ? (
                                    <select
                                      value={pitch.status}
                                      onChange={(e) => handleStatusChange(pitch.id, e.target.value as PitchStatus)}
                                      className="bg-transparent text-white text-xs px-2 py-1 rounded-full border-2 border-sky-500/50 focus:outline-none focus:border-sky-500"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="revise">Revise</option>
                                      <option value="greenlit">Green Lit</option>
                                    </select>
                                  ) : (
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.border} border`}>
                                      <StatusIcon className={`w-3 h-3 ${status.color}`} />
                                      <span className={status.color}>{status.label}</span>
                                    </div>
                                  )}

                                  <span className="text-gray-600">•</span>
                                  <span className="text-gray-400 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {pitch.createdAt.toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Method Badge / Picker */}
                                {isEditingPitch ? (
                                  <div className="mt-3">
                                    <select
                                      value={pitch.scopeTier && pitch.methodology ? `${pitch.scopeTier}|${pitch.methodology}` : ''}
                                      onChange={(e) => handleMethodChange(pitch.id, e.target.value)}
                                      className="bg-transparent text-white text-sm px-2 py-1 rounded-lg border-2 border-sky-500/50 focus:outline-none focus:border-sky-500"
                                    >
                                      <option value="">Select research method</option>
                                      <optgroup label="Simple (20-60 hours)">
                                        {RESEARCH_METHODS.filter(m => m.scope === 'simple').map(m => (
                                          <option key={m.value} value={m.value}>{m.methodology}</option>
                                        ))}
                                      </optgroup>
                                      <optgroup label="Medium (60-120 hours)">
                                        {RESEARCH_METHODS.filter(m => m.scope === 'medium').map(m => (
                                          <option key={m.value} value={m.value}>{m.methodology}</option>
                                        ))}
                                      </optgroup>
                                      <optgroup label="Complex (120-200 hours)">
                                        {RESEARCH_METHODS.filter(m => m.scope === 'complex').map(m => (
                                          <option key={m.value} value={m.value}>{m.methodology}</option>
                                        ))}
                                      </optgroup>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="mt-3 inline-flex items-center gap-2">
                                    <Target className={`w-4 h-4 ${scopeLabel.color}`} />
                                    <span className={`text-sm font-semibold ${scopeLabel.color}`}>
                                      {scopeLabel.label}
                                    </span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-sm text-white">{methodInfo.methodology}</span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-xs text-gray-400">
                                      {methodInfo.hours[0]}-{methodInfo.hours[1]} hrs
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Edit Button */}
                              <button
                                onClick={() => setIsEditingPitch(!isEditingPitch)}
                                className={`p-2.5 rounded-lg transition-colors shrink-0 ${
                                  isEditingPitch
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                              >
                                {isEditingPitch ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Pitch Details - Unified Layout */}
                          <div className="p-5 space-y-5">
                            {/* Pitch Section */}
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                                Pitch
                              </label>
                              <div className={`space-y-3 text-sm px-3 py-2 ${isEditingPitch ? 'border-2 border-sky-500/50 rounded-lg' : ''}`}>
                                {/* Research Question */}
                                <div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-400 min-w-[120px] shrink-0">Research Question:</span>
                                    <div className="flex-1">
                                      {isEditingPitch ? (
                                        <textarea
                                          value={pitch.researchIdea}
                                          onChange={(e) => handleUpdatePitchField(pitch.id, 'researchIdea', e.target.value)}
                                          rows={3}
                                          className="w-full bg-transparent text-white text-sm border-b border-gray-600 focus:outline-none focus:border-white pb-1 resize-none leading-relaxed"
                                        />
                                      ) : (
                                        <span className="text-white leading-relaxed block">
                                          {pitch.researchIdea || 'Not specified'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Expected Impact */}
                                <div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-400 min-w-[120px] shrink-0">Expected Impact:</span>
                                    <div className="flex-1">
                                      {isEditingPitch ? (
                                        <textarea
                                          value={pitch.impact || ''}
                                          onChange={(e) => handleUpdatePitchField(pitch.id, 'impact', e.target.value)}
                                          rows={2}
                                          placeholder="What will this research produce?"
                                          className="w-full bg-transparent text-white text-sm border-b border-gray-600 focus:outline-none focus:border-white pb-1 resize-none leading-relaxed"
                                        />
                                      ) : (
                                        <span className="text-white leading-relaxed block">
                                          {pitch.impact || 'Not specified'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Project & Timeline Info Group */}
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                                Project & Timeline
                              </label>
                              <div className={`space-y-1.5 text-sm px-3 py-2 ${isEditingPitch ? 'border-2 border-sky-500/50 rounded-lg' : ''}`}>
                                {/* Alignment */}
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-400 min-w-[80px] shrink-0">Alignment:</span>
                                  {isEditingPitch ? (
                                    <select
                                      value={pitch.alignment || ''}
                                      onChange={(e) => handleUpdatePitchField(pitch.id, 'alignment', e.target.value)}
                                      className="flex-1 bg-transparent text-white text-sm border-b border-gray-600 focus:outline-none focus:border-white pb-1"
                                    >
                                      <option value="">Select</option>
                                      <option value="current-project">Current Project</option>
                                      <option value="prospected-project">Prospected Project</option>
                                      <option value="thought-leadership">Thought Leadership</option>
                                    </select>
                                  ) : (
                                    <span className="text-white flex-1">
                                      {pitch.alignment === 'current-project' ? 'Current Project' :
                                       pitch.alignment === 'prospected-project' ? 'Prospected Project' :
                                       pitch.alignment === 'thought-leadership' ? 'Thought Leadership' :
                                       'Not specified'}
                                    </span>
                                  )}
                                </div>

                                {/* Project Name */}
                                {(isEditingPitch && (pitch.alignment === 'current-project' || pitch.alignment === 'prospected-project')) || pitch.projectName ? (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-400 min-w-[80px] shrink-0">Project:</span>
                                    {isEditingPitch ? (
                                      <input
                                        type="text"
                                        value={pitch.projectName || ''}
                                        onChange={(e) => handleUpdatePitchField(pitch.id, 'projectName', e.target.value)}
                                        placeholder="e.g., 25-05"
                                        className="flex-1 bg-transparent text-white text-sm border-b border-gray-600 focus:outline-none focus:border-white pb-1"
                                      />
                                    ) : (
                                      <span className="text-white flex-1">{pitch.projectName}</span>
                                    )}
                                  </div>
                                ) : null}

                                {/* Building Off */}
                                {isEditingPitch || pitch.buildingOff ? (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-400 min-w-[80px] shrink-0">Building Off:</span>
                                    {isEditingPitch ? (
                                      <input
                                        type="text"
                                        value={pitch.buildingOff || ''}
                                        onChange={(e) => handleUpdatePitchField(pitch.id, 'buildingOff', e.target.value)}
                                        placeholder="e.g., X25-RB01"
                                        className="flex-1 bg-transparent text-white text-sm border-b border-gray-600 focus:outline-none focus:border-white pb-1"
                                      />
                                    ) : (
                                      <span className="text-white flex-1">{pitch.buildingOff}</span>
                                    )}
                                  </div>
                                ) : null}

                                {/* Partner */}
                                {isEditingPitch || pitch.partner ? (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-400 min-w-[80px] shrink-0">Partner:</span>
                                    {isEditingPitch ? (
                                      <input
                                        type="text"
                                        value={pitch.partner || ''}
                                        onChange={(e) => handleUpdatePitchField(pitch.id, 'partner', e.target.value)}
                                        placeholder="Organization"
                                        className="flex-1 bg-transparent text-white text-sm border-b border-gray-600 focus:outline-none focus:border-white pb-1"
                                      />
                                    ) : (
                                      <span className="text-white flex-1">{pitch.partner}</span>
                                    )}
                                  </div>
                                ) : null}

                                {/* Timeline */}
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-400 min-w-[80px] shrink-0">Timeline:</span>
                                  {isEditingPitch ? (
                                    <div className="flex-1 flex gap-2">
                                      <input
                                        type="text"
                                        value={pitch.timeline || ''}
                                        onChange={(e) => handleUpdatePitchField(pitch.id, 'timeline', e.target.value)}
                                        placeholder="8-12 weeks"
                                        className="flex-1 bg-transparent text-white text-sm border-b border-gray-600 focus:outline-none focus:border-white pb-1"
                                      />
                                      <span className="text-gray-400 text-sm">
                                        ({pitch.scopeTier && pitch.timeline ? calculateHoursPerWeek(pitch.scopeTier, pitch.timeline) : '0'} hrs/wk)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-white flex-1">
                                      {pitch.timeline || 'Not specified'}
                                      {pitch.timeline && pitch.scopeTier && (
                                        <span className="text-gray-400 ml-2">
                                          ({calculateHoursPerWeek(pitch.scopeTier, pitch.timeline)} hrs/week)
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <p className="text-sm">Select a research method to see pitch details</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Comments */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Review Thread
                        </span>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3 mb-4">
                        {pitchComments.length === 0 ? (
                          <p className="text-sm text-gray-500 italic py-4 text-center">
                            No comments yet. Add feedback below.
                          </p>
                        ) : (
                          pitchComments.map((comment) => {
                            const isMine = isMyComment(comment);
                            return (
                              <div key={comment.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                  isMine ? 'bg-gray-700' : 'bg-green-900/50'
                                }`}>
                                  {isMine ? (
                                    <User className="w-4 h-4 text-white" />
                                  ) : (
                                    <Zap className="w-4 h-4 text-green-400" />
                                  )}
                                </div>
                                <div className={`flex-1 ${isMine ? 'text-right' : ''}`}>
                                  <div className={`inline-block rounded-xl p-3 max-w-[90%] ${
                                    isMine ? 'bg-white' : 'bg-gray-800'
                                  }`}>
                                    <p className={`text-sm ${isMine ? 'text-black' : 'text-gray-300'}`}>
                                      {comment.message}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {comment.user?.name || 'Unknown'} - {comment.createdAt.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add Comment */}
                      <div className="border-t border-gray-800 pt-4">
                        <div className="flex gap-2">
                          <textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Add feedback or notes..."
                            rows={1}
                            className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                          />
                          <button
                            onClick={() => handleAddComment(pitch.id)}
                            disabled={!commentInput.trim()}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a pitch to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Determine what content to render
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
        </div>
      );
    }

    if (viewMode === 'my-pitches') {
      return renderMyPitches();
    }

    switch (pitchPath) {
      case 'choice':
        return renderChoiceScreen();
      case 'greenlit':
      case 'builder':
        return renderPitchBuilder();
      default:
        return null;
    }
  };

  return (
    <div className="px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {/* Back button */}
          {(viewMode === 'new' && pitchPath !== 'choice') && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-white hover:bg-gray-700 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-bold text-white">Pitch</h1>
              {authUser?.role === 'admin' && viewMode === 'my-pitches' && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-900/50 text-purple-300 border border-purple-700">
                  Admin View: All Pitches
                </span>
              )}
            </div>
            <p className="text-gray-400">
              {viewMode === 'my-pitches'
                ? authUser?.role === 'admin' ? 'Review and manage all submitted pitches' : 'Review and manage your submitted pitches'
                : 'Submit a new research idea'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setViewMode('my-pitches'); setExpandedPitch(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'my-pitches'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Review Pitches
          </button>
          <button
            onClick={() => { setViewMode('new'); setPitchPath('choice'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'new'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            New Pitch
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${pitchPath}`}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PitchSubmission;
