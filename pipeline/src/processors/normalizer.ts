import type { RawItem, Category, EngagementMetrics } from '@ethpulse/shared';

export interface NormalizedItem {
  sourceId: string;
  canonicalUrl: string;
  title: string;
  author: string | null;
  publishedAt: Date;
  fullText: string;
  engagement: EngagementMetrics | null;
  rawMetadata: Record<string, unknown>;
}

export function normalize(rawItem: RawItem): NormalizedItem | null {
  const metadata = (rawItem.raw_metadata ?? {}) as Record<string, unknown>;

  const title = rawItem.raw_title ?? '';
  const fullText = rawItem.raw_text ?? '';

  // Skip items with no meaningful content
  if (!title && !fullText) return null;

  const author = extractAuthor(rawItem.source_id, metadata);
  const engagement = extractEngagement(rawItem.source_id, metadata);
  const publishedAt = new Date(rawItem.fetched_at);

  return {
    sourceId: rawItem.source_id,
    canonicalUrl: rawItem.canonical_url,
    title,
    author,
    publishedAt,
    fullText: fullText || title,
    engagement,
    rawMetadata: metadata,
  };
}

function extractAuthor(sourceId: string, metadata: Record<string, unknown>): string | null {
  // Discourse sources
  if (metadata.author_username) {
    const name = metadata.author_name as string | undefined;
    const username = metadata.author_username as string;
    return name ? `${name} (@${username})` : `@${username}`;
  }

  // GitHub sources
  if (metadata.author) {
    return `@${metadata.author as string}`;
  }

  // CryptoPanic / Crypto News — use original source name
  if (metadata.source_name) {
    return metadata.source_name as string;
  }

  return null;
}

function extractEngagement(
  sourceId: string,
  metadata: Record<string, unknown>
): EngagementMetrics | null {
  if (
    metadata.like_count !== undefined ||
    metadata.reply_count !== undefined ||
    metadata.views !== undefined
  ) {
    return {
      likes: metadata.like_count as number | undefined,
      replies: metadata.reply_count as number | undefined,
      views: metadata.views as number | undefined,
    };
  }

  // CryptoPanic votes
  if (
    metadata.votes_positive !== undefined ||
    metadata.votes_comments !== undefined
  ) {
    return {
      likes: metadata.votes_positive as number | undefined,
      replies: metadata.votes_comments as number | undefined,
    };
  }

  return null;
}
