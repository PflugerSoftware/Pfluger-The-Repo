/**
 * Fetch Prelaunch Analytics from Supabase
 * Simple script using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all users
console.log('Fetching users...\n');
const { data: users, error: usersError } = await supabase
  .from('users')
  .select('id, email, name, role, office')
  .order('name', { ascending: true });

if (usersError) {
  console.error('Error fetching users:', usersError);
  process.exit(1);
}

console.log(`Found ${users.length} users:\n`);

// Fetch analytics for each user
for (const user of users) {
  // Get page views for this user
  const { data: pageViews, error: pvError } = await supabase
    .from('user_page_views')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: true });

  if (pvError) {
    console.error(`Error fetching page views for ${user.name}:`, pvError);
    continue;
  }

  if (!pageViews || pageViews.length === 0) {
    console.log(`${user.name} (${user.email}): No activity yet\n`);
    continue;
  }

  // Calculate stats
  const uniqueSessions = new Set(pageViews.map(v => v.session_id)).size;

  // Calculate time spent (rough estimate)
  const sessions = {};
  pageViews.forEach(pv => {
    if (!sessions[pv.session_id]) sessions[pv.session_id] = [];
    sessions[pv.session_id].push(pv);
  });

  let totalSeconds = 0;
  Object.values(sessions).forEach(sessionViews => {
    sessionViews.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (let i = 0; i < sessionViews.length - 1; i++) {
      const diff = (new Date(sessionViews[i + 1].timestamp) - new Date(sessionViews[i].timestamp)) / 1000;
      if (diff < 1800) totalSeconds += diff; // Only count if less than 30 min
    }
    totalSeconds += 30; // Estimate 30s for last page
  });

  const totalMinutes = Math.round(totalSeconds / 60);
  const avgSessionMinutes = Math.round(totalMinutes / uniqueSessions);

  // Count page visits
  const pageVisits = {};
  pageViews.forEach(pv => {
    pageVisits[pv.page_name] = (pageVisits[pv.page_name] || 0) + 1;
  });

  const topPages = Object.entries(pageVisits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  console.log(`#### ${user.name} (${user.email})`);
  console.log(`\n**Summary:**`);
  console.log(`- Total Page Views: ${pageViews.length}`);
  console.log(`- Sessions: ${uniqueSessions}`);
  console.log(`- Total Time Spent: ${totalMinutes}m`);
  console.log(`- Average Session Duration: ${avgSessionMinutes}m`);
  console.log(`- Office: ${user.office || 'Not specified'}`);
  console.log(`- Role: ${user.role}`);

  console.log(`\n**Most Visited Pages:**`);
  topPages.forEach(([page, count]) => {
    console.log(`- ${page}: ${count} visits`);
  });

  // Show travel history (first 3 sessions)
  const sessionEntries = Object.entries(sessions).slice(0, 3);
  if (sessionEntries.length > 0) {
    console.log(`\n**Travel History:**`);
    sessionEntries.forEach(([sessionId, sessionViews], idx) => {
      console.log(`\nSession ${idx + 1}:`);
      sessionViews.forEach((pv, pvIdx) => {
        const timestamp = new Date(pv.timestamp);
        const arrow = pvIdx < sessionViews.length - 1 ? ' →' : '';
        console.log(`  ${pvIdx + 1}. ${pv.page_name} (${timestamp.toLocaleTimeString()})${arrow}`);
      });
    });

    if (Object.keys(sessions).length > 3) {
      console.log(`\n_...and ${Object.keys(sessions).length - 3} more sessions_`);
    }
  }

  console.log('\n---\n');
}
