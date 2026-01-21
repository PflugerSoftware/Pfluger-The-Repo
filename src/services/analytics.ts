import { supabase } from '../config/supabase';

export interface PageView {
  id: string;
  userId: string;
  sessionId: string;
  pageName: string;
  referrerPage: string | null;
  timestamp: Date;
}

// Database row type
interface PageViewRow {
  id: string;
  user_id: string;
  session_id: string;
  page_name: string;
  referrer_page: string | null;
  timestamp: string;
}

// Convert database row to PageView
function rowToPageView(row: PageViewRow): PageView {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    pageName: row.page_name,
    referrerPage: row.referrer_page,
    timestamp: new Date(row.timestamp)
  };
}

/**
 * Generate or retrieve session ID from localStorage
 * Session ID persists across page refreshes but resets on new browser session
 */
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics-session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics-session-id', sessionId);
  }
  return sessionId;
}

/**
 * Log a page view
 */
export async function logPageView(
  userId: string,
  pageName: string,
  referrerPage: string | null = null
): Promise<boolean> {
  const sessionId = getSessionId();

  const { error } = await supabase
    .from('user_page_views')
    .insert({
      user_id: userId,
      session_id: sessionId,
      page_name: pageName,
      referrer_page: referrerPage
    });

  if (error) {
    console.error('Error logging page view:', error);
    return false;
  }

  return true;
}

/**
 * Get page views for a user
 */
export async function getUserPageViews(
  userId: string,
  limit?: number
): Promise<PageView[]> {
  let query = supabase
    .from('user_page_views')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading page views:', error);
    return [];
  }

  return (data || []).map(rowToPageView);
}

/**
 * Get page views for a session
 */
export async function getSessionPageViews(sessionId: string): Promise<PageView[]> {
  const { data, error } = await supabase
    .from('user_page_views')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error loading session page views:', error);
    return [];
  }

  return (data || []).map(rowToPageView);
}

/**
 * Get analytics summary for all users
 */
export async function getAnalyticsSummary(startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('user_page_views')
    .select('*');

  if (startDate) {
    query = query.gte('timestamp', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('timestamp', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading analytics summary:', error);
    return null;
  }

  // Calculate summary stats
  const pageViews = (data || []).map(rowToPageView);
  const uniqueUsers = new Set(pageViews.map(pv => pv.userId)).size;
  const uniqueSessions = new Set(pageViews.map(pv => pv.sessionId)).size;
  const pageViewsByPage = pageViews.reduce((acc, pv) => {
    acc[pv.pageName] = (acc[pv.pageName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalPageViews: pageViews.length,
    uniqueUsers,
    uniqueSessions,
    pageViewsByPage,
    mostVisitedPages: Object.entries(pageViewsByPage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }))
  };
}
