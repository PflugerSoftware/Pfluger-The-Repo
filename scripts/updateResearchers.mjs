/**
 * Update researcher names in Supabase project_blocks table
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
  { projectId: 'X24-RB01', researcher: 'Alexander Wickes, Brenda Swirczynski' },
  { projectId: 'X25-RB01', researcher: 'Katherine Wiley, Braden Haley, Alex Wickes, Brenda Swirczynski' },
  { projectId: 'X25-RB02', researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden' },
  { projectId: 'X25-RB03', researcher: 'Katherine Wiley, Brenda Swirczynski' },
  { projectId: 'X25-RB05', researcher: 'Nilen Varade, Alex Wickes' },
  { projectId: 'X25-RB06', researcher: 'Alex Wickes' },
  { projectId: 'X25-RB08', researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden' },
  { projectId: 'X25-RB09', researcher: 'Alex Wickes' },
  { projectId: 'X25-RB10', researcher: 'Alex Wickes' },
  { projectId: 'X25-RB11', researcher: 'Alex Wickes, Agustin Salinas' },
  { projectId: 'X25-RB13', researcher: 'Agustin Salinas, Alex Wickes, Leah VanderSanden' }
];

async function updateResearchers() {
  console.log('Updating researcher names in Supabase...\n');

  for (const update of updates) {
    console.log(`Updating ${update.projectId}...`);

    // Find all header blocks for this project
    const { data: blocks, error: fetchError } = await supabase
      .from('project_blocks')
      .select('id, data')
      .eq('project_id', update.projectId)
      .eq('block_type', 'header');

    if (fetchError) {
      console.error(`  ❌ Error fetching header blocks for ${update.projectId}:`, fetchError.message);
      continue;
    }

    if (!blocks || blocks.length === 0) {
      console.error(`  ❌ No header blocks found for ${update.projectId}`);
      continue;
    }

    // Update each header block
    for (const block of blocks) {
      const updatedData = {
        ...block.data,
        researcher: update.researcher
      };

      const { error: updateError } = await supabase
        .from('project_blocks')
        .update({ data: updatedData })
        .eq('id', block.id);

      if (updateError) {
        console.error(`  ❌ Error updating block ${block.id}:`, updateError.message);
      }
    }

    console.log(`  ✅ Updated ${blocks.length} header block(s) to: ${update.researcher}`);
  }

  console.log('\n✅ All researcher names updated!');

  // Remove X26-RB03
  console.log('\nRemoving X26-RB03 (Gyp Concrete)...');
  const { error: deleteError } = await supabase
    .from('project_blocks')
    .delete()
    .eq('project_id', 'X26-RB03');

  if (deleteError) {
    console.error('❌ Error deleting X26-RB03:', deleteError.message);
  } else {
    console.log('✅ X26-RB03 removed from database');
  }
}

updateResearchers().catch(console.error);
