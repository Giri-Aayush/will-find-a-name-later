import { createClient } from '@supabase/supabase-js';
import { ALL_SOURCES } from '@ethpulse/shared';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`Seeding ${ALL_SOURCES.length} sources (Tiers 1, 2, 3, 5, 6)...`);

  const { error } = await supabase
    .from('source_registry')
    .upsert(ALL_SOURCES, { onConflict: 'id' });

  if (error) {
    console.error('Failed to seed sources:', error.message);
    process.exit(1);
  }

  console.log('Successfully seeded source_registry:');
  for (const source of ALL_SOURCES) {
    console.log(`  - ${source.id} (${source.api_type}, ${source.default_category})`);
  }
}

seed();
