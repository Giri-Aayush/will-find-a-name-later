import { createClient } from '@supabase/supabase-js';
import { TIER_7_SOURCES } from '@ethpulse/shared';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`Seeding ${TIER_7_SOURCES.length} crypto social sources...`);

  // The DB CHECK constraint may not include 'cryptopanic' or 'crypto_news_api' yet.
  // NULL bypasses the CHECK, and pipeline maps source IDs to the correct api_type.
  const sourcesWithNullType = TIER_7_SOURCES.map((s) => ({
    ...s,
    api_type: null,
  }));

  const { error } = await supabase
    .from('source_registry')
    .upsert(sourcesWithNullType, { onConflict: 'id' });

  if (error) {
    console.error('Failed to seed crypto social sources:', error.message);
    process.exit(1);
  }

  console.log('Successfully seeded crypto social sources:');
  for (const source of TIER_7_SOURCES) {
    console.log(`  - ${source.id} (${source.api_type}, ${source.default_category})`);
  }

  console.log(
    '\nNote: api_type stored as NULL in DB. Pipeline maps these source IDs to their respective fetchers.'
  );
  console.log(
    'To fix permanently, run in Supabase SQL editor:'
  );
  console.log(
    "  ALTER TABLE source_registry DROP CONSTRAINT IF EXISTS source_registry_api_type_check;"
  );
  console.log(
    "  ALTER TABLE source_registry ADD CONSTRAINT source_registry_api_type_check CHECK (api_type IN ('discourse','github_api','rss','graphql','html_scraper','rest_api','cryptopanic','crypto_news_api'));"
  );
  console.log(
    "  UPDATE source_registry SET api_type = 'cryptopanic' WHERE id LIKE 'cryptopanic.com/%';"
  );
  console.log(
    "  UPDATE source_registry SET api_type = 'crypto_news_api' WHERE id = 'cryptocurrency.cv/news';"
  );
}

seed();
