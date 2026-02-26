import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function count() {
  const { count: rawTotal } = await supabase
    .from('raw_items')
    .select('*', { count: 'exact', head: true });

  const { count: rawProcessed } = await supabase
    .from('raw_items')
    .select('*', { count: 'exact', head: true })
    .eq('processed', true);

  const { count: rawUnprocessed } = await supabase
    .from('raw_items')
    .select('*', { count: 'exact', head: true })
    .eq('processed', false);

  const { count: cardTotal } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true });

  // Count raw items that are processed but have no corresponding card
  const { data: processedNoCard } = await supabase
    .from('raw_items')
    .select('source_id', { count: 'exact' })
    .eq('processed', true);

  console.log(`Raw items:     ${rawTotal} total, ${rawProcessed} processed, ${rawUnprocessed} unprocessed`);
  console.log(`Cards:         ${cardTotal}`);
  console.log(`Gap:           ${(rawProcessed ?? 0) - (cardTotal ?? 0)} items processed with no card (dry-run victims)`);

  // Check which sources have items processed without cards
  const { data: sourcesWithItems } = await supabase
    .from('raw_items')
    .select('source_id')
    .eq('processed', true);

  const { data: sourcesWithCards } = await supabase
    .from('cards')
    .select('source_id');

  const itemSourceIds = new Set((sourcesWithItems ?? []).map(i => i.source_id));
  const cardSourceIds = new Set((sourcesWithCards ?? []).map(c => c.source_id));

  const missingCardSources = [...itemSourceIds].filter(s => !cardSourceIds.has(s));
  if (missingCardSources.length > 0) {
    console.log(`\nSources with processed items but NO cards:`);
    for (const s of missingCardSources) {
      console.log(`  - ${s}`);
    }
  }
}

count().catch(console.error);
