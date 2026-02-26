import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function status() {
  // Get card counts per source
  const { data: cards } = await supabase.from('cards').select('source_id, category');
  const cardsBySource: Record<string, { count: number; categories: Set<string> }> = {};
  for (const c of cards ?? []) {
    if (!cardsBySource[c.source_id]) cardsBySource[c.source_id] = { count: 0, categories: new Set() };
    cardsBySource[c.source_id].count++;
    cardsBySource[c.source_id].categories.add(c.category);
  }

  // Get raw item counts per source (unprocessed only)
  const PAGE_SIZE = 1000;
  const unprocessedBySource: Record<string, number> = {};
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('raw_items')
      .select('source_id')
      .eq('processed', false)
      .range(offset, offset + PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    for (const item of data) {
      unprocessedBySource[item.source_id] = (unprocessedBySource[item.source_id] ?? 0) + 1;
    }
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  // Get all sources
  const { data: sources } = await supabase
    .from('source_registry')
    .select('id, api_type, default_category')
    .eq('is_active', true)
    .order('id');

  console.log('Source ID'.padEnd(45) + ' API Type'.padEnd(14) + ' Cards'.padEnd(8) + ' Unprocessed'.padEnd(14) + ' Status');
  console.log('─'.repeat(95));

  for (const s of sources ?? []) {
    const cardInfo = cardsBySource[s.id];
    const cardCount = cardInfo?.count ?? 0;
    const unprocessed = unprocessedBySource[s.id] ?? 0;
    const apiType = s.api_type ?? 'rest_api';

    let status = '';
    if (cardCount > 0) status = '✅ VERIFIED';
    else if (unprocessed > 0) status = '⏳ PENDING (' + unprocessed + ' items waiting)';
    else if (s.id === 'forkcast.org') status = '🔇 STUB (by design)';
    else status = '❌ NO DATA';

    console.log(
      `${s.id.padEnd(45)} ${apiType.padEnd(13)} ${String(cardCount).padStart(5)}   ${String(unprocessed).padStart(5)}         ${status}`
    );
  }
}

status().catch(console.error);
