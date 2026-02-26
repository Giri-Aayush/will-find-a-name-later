import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('=== SOURCE REGISTRY ===\n');

  const { data: sources } = await supabase
    .from('source_registry')
    .select('id, api_type, is_active, last_polled_at, default_category')
    .order('id');

  for (const s of sources ?? []) {
    const polled = s.last_polled_at
      ? new Date(s.last_polled_at).toISOString().slice(0, 19)
      : 'NEVER';
    console.log(
      `  ${s.is_active ? '✓' : '✗'} ${s.id.padEnd(45)} api=${String(s.api_type).padEnd(12)} cat=${s.default_category.padEnd(16)} polled=${polled}`
    );
  }

  console.log('\n=== RAW ITEMS PER SOURCE ===\n');

  const { data: rawCounts } = await supabase.rpc('', {}).select('*'); // Can't do GROUP BY via REST
  // Use a different approach: fetch all raw items with source_id only
  const { data: rawItems } = await supabase
    .from('raw_items')
    .select('source_id, processed');

  const rawBySource: Record<string, { total: number; processed: number; unprocessed: number }> = {};
  for (const item of rawItems ?? []) {
    if (!rawBySource[item.source_id]) {
      rawBySource[item.source_id] = { total: 0, processed: 0, unprocessed: 0 };
    }
    rawBySource[item.source_id].total++;
    if (item.processed) rawBySource[item.source_id].processed++;
    else rawBySource[item.source_id].unprocessed++;
  }

  const sortedSources = Object.entries(rawBySource).sort((a, b) => b[1].total - a[1].total);
  let totalRaw = 0;
  let totalProcessed = 0;
  let totalUnprocessed = 0;
  for (const [sourceId, counts] of sortedSources) {
    console.log(
      `  ${sourceId.padEnd(45)} total=${String(counts.total).padStart(4)}  processed=${String(counts.processed).padStart(4)}  unprocessed=${String(counts.unprocessed).padStart(4)}`
    );
    totalRaw += counts.total;
    totalProcessed += counts.processed;
    totalUnprocessed += counts.unprocessed;
  }
  console.log(`  ${'TOTAL'.padEnd(45)} total=${String(totalRaw).padStart(4)}  processed=${String(totalProcessed).padStart(4)}  unprocessed=${String(totalUnprocessed).padStart(4)}`);

  console.log('\n=== CARDS PER CATEGORY ===\n');

  const { data: cards } = await supabase
    .from('cards')
    .select('category, source_id');

  const byCategory: Record<string, number> = {};
  const cardsBySource: Record<string, number> = {};
  for (const card of cards ?? []) {
    byCategory[card.category] = (byCategory[card.category] ?? 0) + 1;
    cardsBySource[card.source_id] = (cardsBySource[card.source_id] ?? 0) + 1;
  }

  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(20)} ${count} cards`);
  }
  console.log(`  ${'TOTAL'.padEnd(20)} ${cards?.length ?? 0} cards`);

  console.log('\n=== CARDS PER SOURCE ===\n');
  for (const [sourceId, count] of Object.entries(cardsBySource).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${sourceId.padEnd(45)} ${count} cards`);
  }

  // Check for sources with raw items but NO cards
  console.log('\n=== SOURCES WITH RAW ITEMS BUT NO CARDS (potential issues) ===\n');
  for (const [sourceId, counts] of sortedSources) {
    if (!cardsBySource[sourceId] && counts.total > 0) {
      console.log(`  ⚠️  ${sourceId}: ${counts.total} raw items, 0 cards (${counts.unprocessed} unprocessed)`);
    }
  }

  // Sample a few cards to check quality
  console.log('\n=== SAMPLE CARDS (latest 5) ===\n');
  const { data: sampleCards } = await supabase
    .from('cards')
    .select('headline, summary, category, source_id, published_at')
    .order('fetched_at', { ascending: false })
    .limit(5);

  for (const card of sampleCards ?? []) {
    const words = card.summary.split(/\s+/).filter(Boolean).length;
    console.log(`  [${card.category}] ${card.headline}`);
    console.log(`    Source: ${card.source_id}`);
    console.log(`    Summary (${words} words): ${card.summary.slice(0, 120)}...`);
    console.log('');
  }
}

verify().catch(console.error);
