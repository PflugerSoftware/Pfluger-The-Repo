import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getProjectConfig } from '../../services/projects';
import type { ProjectConfig } from '../../components/blocks/types';
import ProjectDashboard from './ProjectDashboard';

interface DynamicProjectDashboardProps {
  projectId: string;
  onBack?: () => void;
}

export default function DynamicProjectDashboard({ projectId, onBack }: DynamicProjectDashboardProps) {
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError(null);

      try {
        const projectConfig = await getProjectConfig(projectId);
        if (projectConfig) {
          setConfig(projectConfig);
        } else {
          setError(`Project ${projectId} not found`);
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading project...</span>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    );
  }

  return <ProjectDashboard config={config} onBack={onBack} />;
}
