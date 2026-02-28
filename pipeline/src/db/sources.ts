import { supabase } from './client.js';
import type { SourceRegistry } from '@hexcast/shared';

export async function getActiveSources(apiTypeFilter?: string): Promise<SourceRegistry[]> {
  let query = supabase
    .from('source_registry')
    .select('*')
    .eq('is_active', true);

  if (apiTypeFilter && apiTypeFilter !== 'all') {
    query = query.eq('api_type', apiTypeFilter);
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
