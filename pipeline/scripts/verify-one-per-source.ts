/**
 * Processes exactly ONE unprocessed item from each source that has no cards yet.
 * This verifies the full pipeline (normalize → dedup → classify → summarize → create card)
 * works for every source type without waiting hours for the full batch.
 */
import { createClient } from '@supabase/supabase-js';
import { normalize } from '../src/processors/normalizer.js';
import { isDuplicate } from '../src/processors/deduplicator.js';
import { classify } from '../src/processors/classifier.js';
import { summarize } from '../src/processors/summarizer.js';
import { hashUrl } from '../src/utils/hash.js';
import { logger } from '../src/utils/logger.js';
import type { RawItem, Category } from '@hexcast/shared';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function verifyOnePerSource() {
  // Find sources with no cards
  const { data: cardsData } = await supabase.from('cards').select('source_id');
  const sourcesWithCards = new Set((cardsData ?? []).map((c) => c.source_id));

  // Get all active sources
  const { data: sources } = await supabase
    .from('source_registry')
    .select('id')
    .eq('is_active', true);

  const sourcesNeedingVerification = (sources ?? [])
    .map((s) => s.id)
    .filter((id) => !sourcesWithCards.has(id) && id !== 'forkcast.org');

  console.log(`\nSources needing verification: ${sourcesNeedingVerification.length}\n`);

  let verified = 0;
  let failed = 0;

  for (const sourceId of sourcesNeedingVerification) {
    // Get one unprocessed item from this source
    const { data: items } = await supabase
      .from('raw_items')
      .select('*')
      .eq('source_id', sourceId)
      .eq('processed', false)
      .limit(1);

    if (!items || items.length === 0) {
      console.log(`  ⚠️  ${sourceId}: No unprocessed items to test`);
      continue;
    }

    const item = items[0] as RawItem;
    try {
      // 1. Normalize
      const normalized = normalize(item);
      if (!normalized) {
        console.log(`  ❌ ${sourceId}: Normalization failed (no content)`);
        console.log(`     Title: ${item.raw_title?.slice(0, 80)}`);
        console.log(`     Text length: ${item.raw_text?.length ?? 0}`);
        failed++;
        continue;
      }

      // 2. Check dedup (but don't skip — just log)
      const dup = await isDuplicate(normalized.canonicalUrl, normalized.title, normalized.publishedAt);
      if (dup) {
        console.log(`  ⚠️  ${sourceId}: Item is a duplicate, trying another...`);
        // Try a second item
        const { data: items2 } = await supabase
          .from('raw_items')
          .select('*')
          .eq('source_id', sourceId)
          .eq('processed', false)
          .range(1, 1);
        if (!items2 || items2.length === 0) {
          console.log(`     No more items to try`);
          continue;
        }
        // Skip dedup for second attempt
      }

      // 3. Classify
      const category = classify(normalized.sourceId);

      // 4. Summarize (real Ollama call)
      const startMs = Date.now();
      const { headline, summary } = await summarize(normalized.fullText, normalized.title);
      const elapsedMs = Date.now() - startMs;

      // 5. Create card
      const { error } = await supabase.from('cards').insert({
        source_id: normalized.sourceId,
        canonical_url: normalized.canonicalUrl,
        url_hash: hashUrl(normalized.canonicalUrl),
        category,
        headline,
        summary,
        author: normalized.author,
        published_at: normalized.publishedAt.toISOString(),
        engagement: normalized.engagement,
        pipeline_version: '0.1.0',
      });

      if (error) {
        console.log(`  ❌ ${sourceId}: Card insert failed: ${error.message}`);
        failed++;
        continue;
      }

      // Mark as processed
      await supabase
        .from('raw_items')
        .update({ processed: true })
        .eq('id', item.id);

      const wordCount = summary.split(/\s+/).filter(Boolean).length;
      console.log(`  ✅ ${sourceId} [${category}] (${elapsedMs}ms, ${wordCount} words)`);
      console.log(`     "${headline}"`);
      console.log(`     ${summary.slice(0, 120)}...`);
      verified++;
    } catch (err: any) {
      console.log(`  ❌ ${sourceId}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Verified: ${verified}  Failed: ${failed}  Total: ${sourcesNeedingVerification.length}`);
}

verifyOnePerSource().catch(console.error);
