import type { Category } from '../constants/categories.js';

export interface Card {
  id: string;
  source_id: string;
  canonical_url: string;
  url_hash: string;
  category: Category;
  headline: string;
  summary: string;
  author: string | null;
  published_at: string;
  fetched_at: string;
  engagement: EngagementMetrics | null;
  flag_count: number;
  reaction_up_count: number;
  reaction_down_count: number;
  is_suspended: boolean;
  pipeline_version: string;
}

export interface EngagementMetrics {
  likes?: number;
  replies?: number;
  views?: number;
}

export interface RawItem {
  id: string;
  source_id: string;
  canonical_url: string;
  raw_title: string | null;
  raw_text: string | null;
  raw_metadata: Record<string, unknown> | null;
  fetched_at: string;
  processed: boolean;
}

export interface SourceRegistry {
  id: string;
  display_name: string;
  base_url: string;
  api_type: string | null;
  poll_interval_s: number;
  default_category: Category;
  is_active: boolean;
  last_polled_at: string | null;
}

export interface Flag {
  id: string;
  card_id: string;
  reported_at: string;
  reason: string | null;
  resolved: boolean;
  resolution: string | null;
}
