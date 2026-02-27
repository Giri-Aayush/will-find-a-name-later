import { loadConfig } from './config.js';
import { getActiveSources, updateLastPolledAt } from './db/sources.js';
import { insertRawItem } from './db/raw-items.js';
import { createFetcher } from './fetchers/index.js';
import { processRawItems } from './processors/pipeline.js';
import { logger } from './utils/logger.js';

// Fallback api_type resolution for sources where DB api_type is null
const SOURCE_API_TYPE_MAP: Record<string, string> = {
  'defillama.com/stablecoins': 'rest_api',
  'defillama.com/chains': 'rest_api',
  'defillama.com/dexs': 'rest_api',
  'cryptopanic.com/trending': 'cryptopanic',
  'cryptopanic.com/hot': 'cryptopanic',
  'cryptopanic.com/rising': 'cryptopanic',
  'cryptocurrency.cv/news': 'crypto_news_api',
};

function resolveApiType(sourceId: string): string {
  return SOURCE_API_TYPE_MAP[sourceId] ?? '';
}

function parseSourceFilter(args: string[]): string | undefined {
  const sourcesArg = args.find((arg) => arg.startsWith('--sources='));
  if (!sourcesArg) return undefined;
  const value = sourcesArg.split('=')[1];
  return value === 'all' ? undefined : value;
}

function parseIntervalFilter(args: string[]): { min?: number; max?: number } {
  const minArg = args.find((a) => a.startsWith('--min-interval='));
  const maxArg = args.find((a) => a.startsWith('--max-interval='));
  return {
    min: minArg ? parseInt(minArg.split('=')[1], 10) : undefined,
    max: maxArg ? parseInt(maxArg.split('=')[1], 10) : undefined,
  };
}

async function main() {
  const config = loadConfig();
  const sourceFilter = parseSourceFilter(process.argv);
  const intervalFilter = parseIntervalFilter(process.argv);

  logger.info(`EthPulse Pipeline v${config.pipelineVersion}`);
  logger.info(`Source filter: ${sourceFilter ?? 'all'}`);
  if (intervalFilter.min || intervalFilter.max) {
    logger.info(`Interval filter: min=${intervalFilter.min ?? '-'} max=${intervalFilter.max ?? '-'}`);
  }
  if (config.dryRun) logger.info('DRY RUN mode — no AI calls or card creation');

  // 1. Get active sources
  let sources = await getActiveSources(sourceFilter);

  // Apply interval filtering
  if (intervalFilter.min) {
    sources = sources.filter((s) => s.poll_interval_s >= intervalFilter.min!);
  }
  if (intervalFilter.max) {
    sources = sources.filter((s) => s.poll_interval_s <= intervalFilter.max!);
  }

  logger.info(`Found ${sources.length} active sources`);

  if (sources.length === 0) {
    logger.warn('No sources to process');
    return;
  }

  // 2. Fetch phase
  let totalFetched = 0;
  for (const source of sources) {
    try {
      // Map source ID to api_type when DB value is null (e.g., DefiLlama sources
      // inserted before the rest_api CHECK constraint was added)
      const apiType = source.api_type ?? resolveApiType(source.id);

      const fetcher = createFetcher({
        sourceId: source.id,
        baseUrl: source.base_url,
        apiType,
        lastPolledAt: source.last_polled_at ? new Date(source.last_polled_at) : null,
      });

      const results = await fetcher.fetch();
      logger.info(`Fetched ${results.length} items from ${source.id}`);

      for (const result of results) {
        await insertRawItem(result);
      }

      totalFetched += results.length;
      await updateLastPolledAt(source.id);
    } catch (error) {
      logger.error(`Failed to fetch ${source.id}:`, error);
    }
  }

  logger.info(`Fetch phase complete: ${totalFetched} new items`);

  // 3. Process phase
  const { processed, skipped, failed } = await processRawItems();

  logger.info('Pipeline run complete');
  logger.info(`  Processed: ${processed} cards created`);
  logger.info(`  Skipped: ${skipped} (duplicates, empty, or dry run)`);
  logger.info(`  Failed: ${failed}`);
}

main().catch((error) => {
  logger.error('Pipeline failed:', error);
  process.exit(1);
});
