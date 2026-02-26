import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function reset() {
  // Get all card canonical URLs so we know which items actually have cards
  const { data: cards } = await supabase
    .from('cards')
    .select('canonical_url');

  const cardUrls = new Set((cards ?? []).map((c) => c.canonical_url));
  console.log(`Found ${cardUrls.size} cards in DB`);

  // Get all processed raw items
  const PAGE_SIZE = 1000;
  let offset = 0;
  let resetCount = 0;
  let totalProcessed = 0;

  while (true) {
    const { data: items, error } = await supabase
      .from('raw_items')
      .select('id, canonical_url')
      .eq('processed', true)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!items || items.length === 0) break;

    // Find items that are processed but have no card
    const victims = items.filter((item) => !cardUrls.has(item.canonical_url));
    totalProcessed += items.length;

    if (victims.length > 0) {
      const victimIds = victims.map((v) => v.id);

      // Reset in batches of 100
      for (let i = 0; i < victimIds.length; i += 100) {
        const batch = victimIds.slice(i, i + 100);
        const { error: updateError } = await supabase
          .from('raw_items')
          .update({ processed: false })
          .in('id', batch);

        if (updateError) throw updateError;
        resetCount += batch.length;
      }
    }

    if (items.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`Total processed items scanned: ${totalProcessed}`);
  console.log(`Reset ${resetCount} dry-run victim items back to processed=false`);
  console.log(`These items will be picked up by the next pipeline run`);
}

reset().catch(console.error);
