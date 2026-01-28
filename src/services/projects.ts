import { supabase } from '../config/supabase';
import type { ProjectConfig, BlockConfig, BlockType } from '../components/blocks/types';

// Project metadata - small static config (blocks come from database)
const PROJECT_METADATA: Record<string, Omit<ProjectConfig, 'blocks'>> = {
  'X24-RB01': {
    id: 'X24-RB01',
    title: 'Immersive Learning',
    code: 'X24-RB01',
    subtitle: 'Exploring Immersive Technologies in Education',
    category: 'immersive',
    researcher: 'Alexander Wickes, Brenda Swirczynski',
    totalHours: 40,
    accentColor: '#00A9E0',
  },
  'X25-RB01': {
    id: 'X25-RB01',
    title: 'Sanctuary Spaces',
    code: 'X25-RB01',
    subtitle: 'Designing Spaces for Emotional Regulation',
    category: 'psychology',
    researcher: 'Katherine Wiley, Braden Haley, Alex Wickes, Brenda Swirczynski',
    totalHours: 120,
    accentColor: '#9A3324',
  },
  'X25-RB02': {
    id: 'X25-RB02',
    title: 'The Modulizer Part 2',
    code: 'X25-RB02',
    subtitle: 'Flour Bluff CTE Center - Energy Analysis',
    category: 'sustainability',
    researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden',
    totalHours: 40,
    accentColor: '#67823A',
  },
  'X25-RB03': {
    id: 'X25-RB03',
    title: 'A4LE Design Awards',
    code: 'X25-RB03',
    subtitle: 'Association for Learning Environments Recognition',
    category: 'recognition',
    researcher: 'Katherine Wiley, Brenda Swirczynski',
    totalHours: 8,
    accentColor: '#F2A900',
  },
  'X25-RB05': {
    id: 'X25-RB05',
    title: 'Mass Timber',
    code: 'X25-RB05',
    subtitle: 'AISD Crockett ECHS - Mass Timber Cost Analysis',
    category: 'sustainability',
    researcher: 'Nilen Varade, Alex Wickes',
    totalHours: 40,
    accentColor: '#67823A',
  },
  'X25-RB06': {
    id: 'X25-RB06',
    title: 'Timberlyne Study',
    code: 'X25-RB06',
    subtitle: 'Mass Engineered Timber Design Assist',
    category: 'sustainability',
    researcher: 'Alex Wickes',
    totalHours: 20,
    accentColor: '#67823A',
  },
  'X25-RB08': {
    id: 'X25-RB08',
    title: 'The Modulizer Part 1',
    code: 'X25-RB08',
    subtitle: 'Kennedy Elementary - Energy & Daylighting Analysis',
    category: 'sustainability',
    researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden',
    totalHours: 80,
    accentColor: '#67823A',
  },
  'X25-RB13': {
    id: 'X25-RB13',
    title: 'The Modulizer Part 3',
    code: 'X25-RB13',
    subtitle: 'Flour Bluff CTE Center - Design Concept Survey Analysis',
    category: 'sustainability',
    researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden',
    totalHours: 40,
    accentColor: '#00A9E0',
  },
};

// Database block row type
interface DBBlock {
  id: string;
  project_id: string;
  block_type: string;
  block_order: number;
  data: Record<string, unknown>;
}

// Transform database block to BlockConfig
function dbBlockToConfig(dbBlock: DBBlock): BlockConfig {
  return {
    type: dbBlock.block_type as BlockType,
    id: dbBlock.id,
    data: dbBlock.data,
  };
}

// Fetch project config from database
export async function getProjectConfig(projectId: string): Promise<ProjectConfig | null> {
  const metadata = PROJECT_METADATA[projectId];
  if (!metadata) {
    console.error(`No metadata found for project: ${projectId}`);
    return null;
  }

  // Fetch blocks from database
  const { data: blocks, error } = await supabase
    .from('project_blocks')
    .select('id, project_id, block_type, block_order, data')
    .eq('project_id', projectId)
    .order('block_order', { ascending: true });

  if (error) {
    console.error(`Error fetching blocks for ${projectId}:`, error);
    return null;
  }

  if (!blocks || blocks.length === 0) {
    console.warn(`No blocks found for project: ${projectId}`);
    return {
      ...metadata,
      blocks: [],
    };
  }

  return {
    ...metadata,
    blocks: blocks.map(dbBlockToConfig),
  };
}

// Get all available project IDs
export function getProjectIds(): string[] {
  return Object.keys(PROJECT_METADATA);
}

// Check if a project exists
export function hasProject(projectId: string): boolean {
  return projectId in PROJECT_METADATA;
}

// Get project metadata only (no blocks)
export function getProjectMetadata(projectId: string): Omit<ProjectConfig, 'blocks'> | null {
  return PROJECT_METADATA[projectId] || null;
}
