import { createClient } from '@supabase/supabase-js';
import { TIER_6_SOURCES } from '@ethpulse/shared';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`Seeding ${TIER_6_SOURCES.length} DefiLlama sources...`);

  // The DB has a CHECK constraint that doesn't include 'rest_api' yet.
  // NULL bypasses the CHECK, and we map NULL -> 'rest_api' in the pipeline code.
  const sourcesWithNullType = TIER_6_SOURCES.map((s) => ({
    ...s,
    api_type: null,
  }));

  const { error } = await supabase
    .from('source_registry')
    .upsert(sourcesWithNullType, { onConflict: 'id' });

  if (error) {
    console.error('Failed to seed DefiLlama sources:', error.message);
    process.exit(1);
  }

  console.log('Successfully seeded DefiLlama sources:');
  for (const source of TIER_6_SOURCES) {
    console.log(`  - ${source.id} (${source.api_type}, ${source.default_category})`);
  }

  console.log(
    '\nNote: api_type stored as NULL in DB. Pipeline maps these source IDs to rest_api fetcher.'
  );
  console.log(
    'To fix permanently, run in Supabase SQL editor:'
  );
  console.log(
    "  ALTER TABLE source_registry DROP CONSTRAINT source_registry_api_type_check;"
  );
  console.log(
    "  ALTER TABLE source_registry ADD CONSTRAINT source_registry_api_type_check CHECK (api_type IN ('discourse', 'github_api', 'rss', 'graphql', 'html_scraper', 'rest_api'));"
  );
  console.log(
    "  UPDATE source_registry SET api_type = 'rest_api' WHERE id LIKE 'defillama.com/%';"
  );
}

seed();
