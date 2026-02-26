import { supabase } from './client.js';
import type { SourceRegistry } from '@ethpulse/shared';

// Known source IDs that use rest_api but are stored with NULL api_type in the DB
const REST_API_SOURCE_IDS = [
  'defillama.com/stablecoins',
  'defillama.com/chains',
  'defillama.com/dexs',
];

export async function getActiveSources(apiTypeFilter?: string): Promise<SourceRegistry[]> {
  let query = supabase
    .from('source_registry')
    .select('*')
    .eq('is_active', true);

  if (apiTypeFilter && apiTypeFilter !== 'all') {
    if (apiTypeFilter === 'rest_api') {
      // rest_api sources may have NULL api_type in DB — filter by known IDs
      query = query.in('id', REST_API_SOURCE_IDS);
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
