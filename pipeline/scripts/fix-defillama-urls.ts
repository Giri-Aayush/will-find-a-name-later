/**
 * One-time script: Fix broken DefiLlama canonical URLs in the database.
 *
 * Old format:  https://defillama.com/dex/slug/2026-02-26       → 404
 * New format:  https://defillama.com/dexs?snapshot=2026-02-26&protocol=slug  → works
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

async function fixUrls() {
  // Fetch all DefiLlama cards
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, canonical_url, source_id')
    .in('source_id', ['defillama.com/dexs', 'defillama.com/stablecoins', 'defillama.com/chains']);

  if (error) {
    console.error('Failed to fetch cards:', error.message);
    process.exit(1);
  }

  console.log(`Found ${cards.length} DefiLlama cards to check`);

  let fixed = 0;

  for (const card of cards) {
    const url = card.canonical_url;
    let newUrl: string | null = null;

    // DEX: /dex/slug/date → /dexs?snapshot=date&protocol=slug
    const dexMatch = url.match(/^https:\/\/defillama\.com\/dex\/([^/]+)\/(\d{4}-\d{2}-\d{2})$/);
    if (dexMatch) {
      newUrl = `https://defillama.com/dexs?snapshot=${dexMatch[2]}&protocol=${dexMatch[1]}`;
    }

    // Stablecoins: /stablecoins/symbol/date → /stablecoins?snapshot=date&symbol=symbol
    const stableMatch = url.match(/^https:\/\/defillama\.com\/stablecoins\/([^/]+)\/(\d{4}-\d{2}-\d{2})$/);
    if (stableMatch) {
      newUrl = `https://defillama.com/stablecoins?snapshot=${stableMatch[2]}&symbol=${stableMatch[1]}`;
    }

    // Chains: /chain/chain/date → /chain/chain?snapshot=date
    const chainMatch = url.match(/^https:\/\/defillama\.com\/chain\/([^/]+)\/(\d{4}-\d{2}-\d{2})$/);
    if (chainMatch) {
      newUrl = `https://defillama.com/chain/${chainMatch[1]}?snapshot=${chainMatch[2]}`;
    }

    if (newUrl && newUrl !== url) {
      const { error: updateErr } = await supabase
        .from('cards')
        .update({ canonical_url: newUrl })
        .eq('id', card.id);

      if (updateErr) {
        console.error(`  ✗ ${card.id}: ${updateErr.message}`);
      } else {
        console.log(`  ✓ ${card.source_id}: ${url} → ${newUrl}`);
        fixed++;
      }
    }
  }

  console.log(`\nDone. Fixed ${fixed}/${cards.length} URLs.`);
}

fixUrls();
