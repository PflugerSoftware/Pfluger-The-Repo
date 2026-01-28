/**
 * Update researcher names in Supabase projects table
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

// Researcher updates
const updates = [
  { id: 'X24-RB01', researcher: 'Alexander Wickes, Brenda Swirczynski' },
  { id: 'X25-RB01', researcher: 'Katherine Wiley, Braden Haley, Alex Wickes, Brenda Swirczynski' },
  { id: 'X25-RB02', researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden' },
  { id: 'X25-RB03', researcher: 'Katherine Wiley, Brenda Swirczynski' },
  { id: 'X25-RB05', researcher: 'Nilen Varade, Alex Wickes' },
  { id: 'X25-RB06', researcher: 'Alex Wickes' },
  { id: 'X25-RB08', researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden' },
  { id: 'X25-RB09', researcher: 'Alex Wickes' },
  { id: 'X25-RB10', researcher: 'Alex Wickes' },
  { id: 'X25-RB11', researcher: 'Alex Wickes, Agustin Salinas' },
  { id: 'X25-RB13', researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden' }
];

async function updateResearchers() {
  console.log('Updating researcher names in projects table...\n');

  for (const update of updates) {
    console.log(`Updating ${update.id}...`);

    const { error } = await supabase
      .from('projects')
      .update({ researcher: update.researcher })
      .eq('id', update.id);

    if (error) {
      console.error(`  ❌ Error updating ${update.id}:`, error.message);
    } else {
      console.log(`  ✅ Updated to: ${update.researcher}`);
    }
  }

  console.log('\n✅ All researcher names updated in projects table!');

  // Remove X26-RB03
  console.log('\nRemoving X26-RB03 (Gyp Concrete) from projects table...');
  const { error: deleteError } = await supabase
    .from('projects')
    .delete()
    .eq('id', 'X26-RB03');

  if (deleteError) {
    console.error('❌ Error deleting X26-RB03:', deleteError.message);
  } else {
    console.log('✅ X26-RB03 removed from projects table');
  }
}

updateResearchers().catch(console.error);
