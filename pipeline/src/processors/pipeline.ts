import { getUnprocessedItems, markAsProcessed } from '../db/raw-items.js';
import { createCard } from '../db/cards.js';
import { normalize } from './normalizer.js';
import { isDuplicate } from './deduplicator.js';
import { classify } from './classifier.js';
import { summarize } from './summarizer.js';
import { hashUrl } from '../utils/hash.js';
import { loadConfig } from '../config.js';
import { logger } from '../utils/logger.js';

export async function processRawItems(): Promise<{ processed: number; skipped: number; failed: number }> {
  const config = loadConfig();
  const items = await getUnprocessedItems();

  logger.info(`Processing ${items.length} unprocessed items`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    try {
      // 1. Normalize
      const normalized = normalize(item);
      if (!normalized) {
        logger.debug(`Skipping item ${item.id}: no meaningful content`);
        await markAsProcessed(item.id);
        skipped++;
        continue;
      }

      // 2. Deduplicate
      const duplicate = await isDuplicate(
        normalized.canonicalUrl,
        normalized.title,
        normalized.publishedAt
      );
      if (duplicate) {
        logger.debug(`Skipping duplicate: ${normalized.canonicalUrl}`);
        await markAsProcessed(item.id);
        skipped++;
        continue;
      }

      // 3. Classify
      const category = classify(normalized.sourceId);

      // 4. Summarize
      if (config.dryRun) {
        logger.info(`[DRY RUN] Would summarize: ${normalized.title}`);
        // Do NOT mark as processed — dry run is for testing only,
        // items should remain unprocessed for real pipeline runs
        skipped++;
        continue;
      }

      const { headline, summary } = await summarize(normalized.fullText, normalized.title);

      // 5. Create card
      await createCard({
        sourceId: normalized.sourceId,
        canonicalUrl: normalized.canonicalUrl,
        urlHash: hashUrl(normalized.canonicalUrl),
        category,
        headline,
        summary,
        author: normalized.author,
        publishedAt: normalized.publishedAt,
        engagement: normalized.engagement,
        pipelineVersion: config.pipelineVersion,
      });

      await markAsProcessed(item.id);
      processed++;

      logger.info(`Created card: "${headline}" [${category}] (${processed}/${items.length})`);

      // Small delay between items (local Ollama needs no rate limiting,
      // but prevents overwhelming the DB with rapid writes)
      await new Promise((r) => setTimeout(r, 100));
    } catch (error) {
      failed++;
      logger.error(`Failed to process item ${item.id} (${item.canonical_url}):`, error);
      // Don't mark as processed — it will be retried next run
    }
  }

  return { processed, skipped, failed };
}
