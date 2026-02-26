import { supabase } from './client.js';
import type { Card, Category, EngagementMetrics } from '@ethpulse/shared';

export interface CreateCardParams {
  sourceId: string;
  canonicalUrl: string;
  urlHash: string;
  category: Category;
  headline: string;
  summary: string;
  author: string | null;
  publishedAt: Date;
  engagement: EngagementMetrics | null;
  pipelineVersion: string;
}

export async function createCard(params: CreateCardParams): Promise<void> {
  const { error } = await supabase.from('cards').insert({
    source_id: params.sourceId,
    canonical_url: params.canonicalUrl,
    url_hash: params.urlHash,
    category: params.category,
    headline: params.headline,
    summary: params.summary,
    author: params.author,
    published_at: params.publishedAt.toISOString(),
    engagement: params.engagement,
    pipeline_version: params.pipelineVersion,
  });

  if (error) throw new Error(`Failed to create card for ${params.canonicalUrl}: ${error.message}`);
}

export async function findByUrlHash(urlHash: string): Promise<Card | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('url_hash', urlHash)
    .maybeSingle();

  if (error) throw new Error(`Failed to find card by hash: ${error.message}`);
  return data;
}

export async function findByTimeRange(
  from: Date,
  to: Date
): Promise<Array<{ headline: string; published_at: string }>> {
  const { data, error } = await supabase
    .from('cards')
    .select('headline, published_at')
    .gte('published_at', from.toISOString())
    .lte('published_at', to.toISOString());

  if (error) throw new Error(`Failed to find cards in time range: ${error.message}`);
  return data ?? [];
}
