import { supabase } from '../config/supabase';

// ============================================
// Types
// ============================================

export type PitchStatus = 'pending' | 'revise' | 'greenlit';

export interface Pitch {
  id: string;
  userId: string | null;
  userName: string | null;
  title: string;
  status: PitchStatus;
  researchIdea: string;
  alignment: string | null;
  projectName: string | null;
  buildingOff: string | null;
  partner: string | null;
  methodology: string | null;
  scopeTier: string | null;
  impact: string | null;
  timeline: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PitchAiSession {
  id: string;
  pitchId: string;
  userId: string | null;
  messages: PitchChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PitchChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PitchComment {
  id: string;
  pitchId: string;
  userId: string | null;
  message: string;
  createdAt: Date;
  // Joined user data
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  office: string | null;
  avatarUrl: string | null;
}

// Database row types
interface PitchRow {
  id: string;
  user_id: string | null;
  title: string;
  status: string;
  research_idea: string;
  alignment: string | null;
  project_name: string | null;
  building_off: string | null;
  partner: string | null;
  methodology: string | null;
  scope_tier: string | null;
  impact: string | null;
  timeline: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
  };
}

interface PitchAiSessionRow {
  id: string;
  pitch_id: string;
  user_id: string | null;
  messages: PitchChatMessage[];
  created_at: string;
  updated_at: string;
}

interface PitchCommentRow {
  id: string;
  pitch_id: string;
  user_id: string | null;
  message: string;
  created_at: string;
  users?: {
    name: string;
    email: string;
    role: string;
  };
}

// ============================================
// Converters
// ============================================

function rowToPitch(row: PitchRow): Pitch {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.users?.name || null,
    title: row.title,
    status: row.status as PitchStatus,
    researchIdea: row.research_idea,
    alignment: row.alignment,
    projectName: row.project_name,
    buildingOff: row.building_off,
    partner: row.partner,
    methodology: row.methodology,
    scopeTier: row.scope_tier,
    impact: row.impact,
    timeline: row.timeline,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function rowToAiSession(row: PitchAiSessionRow): PitchAiSession {
  return {
    id: row.id,
    pitchId: row.pitch_id,
    userId: row.user_id,
    messages: (row.messages || []).map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    })),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function rowToComment(row: PitchCommentRow): PitchComment {
  return {
    id: row.id,
    pitchId: row.pitch_id,
    userId: row.user_id,
    message: row.message,
    createdAt: new Date(row.created_at),
    user: row.users ? {
      name: row.users.name,
      email: row.users.email,
      role: row.users.role
    } : undefined
  };
}

// ============================================
// Pitch CRUD
// ============================================

/**
 * Get all pitches (optionally filter by status or user)
 */
export async function getPitches(options?: {
  userId?: string;
  status?: PitchStatus;
  availableOnly?: boolean;
}): Promise<Pitch[]> {
  let query = supabase
    .from('pitches')
    .select(`
      *,
      users (name)
    `)
    .order('created_at', { ascending: false });

  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.availableOnly) {
    query = query.is('user_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading pitches:', error);
    return [];
  }

  return (data || []).map(rowToPitch);
}

/**
 * Get a single pitch by ID
 */
export async function getPitch(pitchId: string): Promise<Pitch | null> {
  const { data, error } = await supabase
    .from('pitches')
    .select('*')
    .eq('id', pitchId)
    .single();

  if (error) {
    console.error('Error loading pitch:', error);
    return null;
  }

  return rowToPitch(data);
}

/**
 * Create a new pitch
 */
export async function createPitch(pitch: {
  id: string;
  userId: string | null;
  title: string;
  researchIdea: string;
  status?: PitchStatus;
  alignment?: string;
  projectName?: string;
  buildingOff?: string;
  partner?: string;
  methodology?: string;
  scopeTier?: string;
  impact?: string;
  timeline?: string;
}): Promise<Pitch | null> {
  const { data, error } = await supabase
    .from('pitches')
    .insert({
      id: pitch.id,
      user_id: pitch.userId,
      title: pitch.title,
      research_idea: pitch.researchIdea,
      status: pitch.status || 'pending',
      alignment: pitch.alignment || null,
      project_name: pitch.projectName || null,
      building_off: pitch.buildingOff || null,
      partner: pitch.partner || null,
      methodology: pitch.methodology || null,
      scope_tier: pitch.scopeTier || null,
      impact: pitch.impact || null,
      timeline: pitch.timeline || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pitch:', error);
    return null;
  }

  return rowToPitch(data);
}

/**
 * Update a pitch
 */
export async function updatePitch(
  pitchId: string,
  updates: Partial<{
    userId: string | null;
    title: string;
    status: PitchStatus;
    researchIdea: string;
    alignment: string;
    projectName: string;
    buildingOff: string;
    partner: string;
    methodology: string;
    scopeTier: string;
    impact: string;
    timeline: string;
  }>
): Promise<boolean> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.researchIdea !== undefined) dbUpdates.research_idea = updates.researchIdea;
  if (updates.alignment !== undefined) dbUpdates.alignment = updates.alignment;
  if (updates.projectName !== undefined) dbUpdates.project_name = updates.projectName;
  if (updates.buildingOff !== undefined) dbUpdates.building_off = updates.buildingOff;
  if (updates.partner !== undefined) dbUpdates.partner = updates.partner;
  if (updates.methodology !== undefined) dbUpdates.methodology = updates.methodology;
  if (updates.scopeTier !== undefined) dbUpdates.scope_tier = updates.scopeTier;
  if (updates.impact !== undefined) dbUpdates.impact = updates.impact;
  if (updates.timeline !== undefined) dbUpdates.timeline = updates.timeline;

  const { error } = await supabase
    .from('pitches')
    .update(dbUpdates)
    .eq('id', pitchId);

  if (error) {
    console.error('Error updating pitch:', error);
    return false;
  }

  return true;
}

/**
 * Claim a greenlit pitch (assign user)
 */
export async function claimPitch(pitchId: string, userId: string): Promise<boolean> {
  return updatePitch(pitchId, { userId });
}

/**
 * Delete a pitch
 */
export async function deletePitch(pitchId: string): Promise<boolean> {
  const { error } = await supabase
    .from('pitches')
    .delete()
    .eq('id', pitchId);

  if (error) {
    console.error('Error deleting pitch:', error);
    return false;
  }

  return true;
}

/**
 * Generate next pitch ID (P-YYYY-XXX format)
 */
export async function generatePitchId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `P-${year}-`;

  const { data, error } = await supabase
    .from('pitches')
    .select('id')
    .like('id', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error generating pitch ID:', error);
    return `${prefix}001`;
  }

  if (!data || data.length === 0) {
    return `${prefix}001`;
  }

  const lastId = data[0].id;
  const lastNum = parseInt(lastId.split('-')[2], 10);
  const nextNum = String(lastNum + 1).padStart(3, '0');

  return `${prefix}${nextNum}`;
}

// ============================================
// Pitch AI Sessions (Ezra chats)
// ============================================

/**
 * Get AI session for a pitch
 */
export async function getPitchAiSession(pitchId: string): Promise<PitchAiSession | null> {
  const { data, error } = await supabase
    .from('pitch_ai_sessions')
    .select('*')
    .eq('pitch_id', pitchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    console.error('Error loading pitch AI session:', error);
    return null;
  }

  return rowToAiSession(data);
}

/**
 * Create or update AI session for a pitch
 */
export async function savePitchAiSession(
  pitchId: string,
  userId: string | null,
  messages: PitchChatMessage[]
): Promise<PitchAiSession | null> {
  // Check if session exists
  const existing = await getPitchAiSession(pitchId);

  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('pitch_ai_sessions')
      .update({ messages })
      .eq('pitch_id', pitchId)
      .select()
      .single();

    if (error) {
      console.error('Error updating pitch AI session:', error);
      return null;
    }

    return rowToAiSession(data);
  } else {
    // Insert
    const { data, error } = await supabase
      .from('pitch_ai_sessions')
      .insert({
        pitch_id: pitchId,
        user_id: userId,
        messages
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pitch AI session:', error);
      return null;
    }

    return rowToAiSession(data);
  }
}

// ============================================
// Pitch Comments (Human review thread)
// ============================================

/**
 * Get all comments for a pitch
 */
export async function getPitchComments(pitchId: string): Promise<PitchComment[]> {
  const { data, error } = await supabase
    .from('pitch_comments')
    .select(`
      *,
      users (name, email, role)
    `)
    .eq('pitch_id', pitchId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading pitch comments:', error);
    return [];
  }

  return (data || []).map(rowToComment);
}

/**
 * Add a comment to a pitch
 */
export async function addPitchComment(
  pitchId: string,
  userId: string,
  message: string
): Promise<PitchComment | null> {
  const { data, error } = await supabase
    .from('pitch_comments')
    .insert({
      pitch_id: pitchId,
      user_id: userId,
      message
    })
    .select(`
      *,
      users (name, email, role)
    `)
    .single();

  if (error) {
    console.error('Error adding pitch comment:', error);
    return null;
  }

  return rowToComment(data);
}

/**
 * Delete a comment
 */
export async function deletePitchComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('pitch_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting pitch comment:', error);
    return false;
  }

  return true;
}

// ============================================
// Users
// ============================================

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error loading user:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    office: data.office,
    avatarUrl: data.avatar_url
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    console.error('Error loading user:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    office: data.office,
    avatarUrl: data.avatar_url
  };
}
