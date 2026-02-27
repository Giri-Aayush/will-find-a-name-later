import { supabase } from './supabase';
import type { Card, SourceRegistry } from '@ethpulse/shared';

export interface CardQueryParams {
  cursor?: string;
  limit?: number;
  category?: string;
  source?: string;
}

export async function getCards(params: CardQueryParams = {}): Promise<Card[]> {
  const { cursor, limit = 20, category, source } = params;

  let query = supabase
    .from('cards')
    .select('*')
    .eq('is_suspended', false)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('published_at', cursor);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (source) {
    query = query.eq('source_id', source);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch cards: ${error.message}`);
  return interleaveBySource((data ?? []) as Card[]);
}

/**
 * Interleave cards so no two consecutive cards share the same category.
 * Groups by category (not source_id, since many sources share a category),
 * maintains chronological order within each group, then round-robins
 * across categories for maximum diversity.
 */
function interleaveBySource(cards: Card[]): Card[] {
  if (cards.length <= 1) return cards;

  // Group by category
  const byCategory: Map<string, Card[]> = new Map();
  for (const card of cards) {
    if (!byCategory.has(card.category)) byCategory.set(card.category, []);
    byCategory.get(card.category)!.push(card);
  }

  // Sort category groups by size descending so the largest gets spread out
  const queues = [...byCategory.values()].sort((a, b) => b.length - a.length);

  const result: Card[] = [];
  while (result.length < cards.length) {
    let added = false;
    for (const q of queues) {
      if (q.length > 0) {
        result.push(q.shift()!);
        added = true;
      }
    }
    if (!added) break;
  }

  return result;
}

export async function getCardById(id: string): Promise<Card | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch card: ${error.message}`);
  return data as Card | null;
}

export async function getSources(): Promise<SourceRegistry[]> {
  const { data, error } = await supabase
    .from('source_registry')
    .select('*')
    .eq('is_active', true)
    .order('display_name');

  if (error) throw new Error(`Failed to fetch sources: ${error.message}`);
  return (data ?? []) as SourceRegistry[];
}
