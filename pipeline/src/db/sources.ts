import { supabase } from './client.js';
import type { SourceRegistry } from '@ethpulse/shared';

// Known source IDs that use rest_api but are stored with NULL api_type in the DB
const REST_API_SOURCE_IDS = [
  'defillama.com/stablecoins',
  'defillama.com/chains',
  'defillama.com/dexs',
];

const CRYPTOPANIC_SOURCE_IDS = [
  'cryptopanic.com/trending',
  'cryptopanic.com/hot',
  'cryptopanic.com/rising',
];

const CRYPTO_NEWS_SOURCE_IDS = [
  'cryptocurrency.cv/news',
];

// Map filter aliases to source ID arrays for api_types stored with NULL in DB
const SOURCE_ID_FILTERS: Record<string, string[]> = {
  rest_api: REST_API_SOURCE_IDS,
  cryptopanic: CRYPTOPANIC_SOURCE_IDS,
  crypto_news_api: CRYPTO_NEWS_SOURCE_IDS,
};

export async function getActiveSources(apiTypeFilter?: string): Promise<SourceRegistry[]> {
  let query = supabase
    .from('source_registry')
    .select('*')
    .eq('is_active', true);

  if (apiTypeFilter && apiTypeFilter !== 'all') {
    const knownIds = SOURCE_ID_FILTERS[apiTypeFilter];
    if (knownIds) {
      // These api_types may have NULL api_type in DB — filter by known IDs
      query = query.in('id', knownIds);
    } else {
      query = query.eq('api_type', apiTypeFilter);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch sources: ${error.message}`);
  return data ?? [];
}

export async function updateLastPolledAt(sourceId: string): Promise<void> {
  const { error } = await supabase
    .from('source_registry')
    .update({ last_polled_at: new Date().toISOString() })
    .eq('id', sourceId);

  if (error) throw new Error(`Failed to update last_polled_at for ${sourceId}: ${error.message}`);
}
