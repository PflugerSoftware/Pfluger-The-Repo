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
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Database row type
interface ChatSessionRow {
  id: string;
  username: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Convert database row to ChatSession
function rowToSession(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
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
export async function loadChatSessions(username: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('username', username)
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
  username: string,
  session: ChatSession
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      id: session.id,
      username,
      title: session.title,
      messages: session.messages,
      created_at: session.createdAt.toISOString(),
      updated_at: session.updatedAt.toISOString()
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
    messages,
    updated_at: new Date().toISOString()
  };

  if (title) {
    updates.title = title;
  }

  const { error } = await supabase
    .from('chat_sessions')
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
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }

  return true;
}
