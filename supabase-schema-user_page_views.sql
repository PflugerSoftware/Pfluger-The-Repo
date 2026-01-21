-- User Page Views Analytics Table
-- Tracks user navigation through the application for analytics and UX insights

CREATE TABLE IF NOT EXISTS user_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  referrer_page TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_page_views_user_id ON user_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_page_views_session_id ON user_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_user_page_views_timestamp ON user_page_views(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_page_views_page_name ON user_page_views(page_name);

-- Disable Row Level Security (using custom auth, not Supabase Auth)
ALTER TABLE user_page_views DISABLE ROW LEVEL SECURITY;

-- Comment on table
COMMENT ON TABLE user_page_views IS 'Tracks user page navigation for analytics and UX insights. Each row represents a single page view with timestamp, session context, and referrer information.';
