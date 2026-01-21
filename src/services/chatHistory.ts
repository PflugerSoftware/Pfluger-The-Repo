import { supabase } from '../config/supabase';
import type { Source } from './rag';

// Types matching TheRepo's chat structure
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  model?: 'haiku' | 'sonnet' | 'opus';
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Database row type
interface ChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Convert database row to ChatSession
function rowToSession(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    messages: row.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    })),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

/**
 * Load all chat sessions for a user
 */
export async function loadChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('repo_ai_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading chat sessions:', error);
    return [];
  }

  return (data || []).map(rowToSession);
}

/**
 * Save a new chat session
 */
export async function createChatSession(
  userId: string,
  session: Omit<ChatSession, 'userId'>
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('repo_ai_sessions')
    .insert({
      id: session.id,
      user_id: userId,
      title: session.title,
      messages: session.messages
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    return null;
  }

  return rowToSession(data);
}

/**
 * Update an existing chat session
 */
export async function updateChatSession(
  sessionId: string,
  messages: ChatMessage[],
  title?: string
): Promise<boolean> {
  const updates: Record<string, unknown> = {
    messages
  };

  if (title) {
    updates.title = title;
  }

  const { error } = await supabase
    .from('repo_ai_sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating chat session:', error);
    return false;
  }

  return true;
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('repo_ai_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }

  return true;
}
