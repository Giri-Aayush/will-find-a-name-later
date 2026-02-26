export interface FetchResult {
  sourceId: string;
  canonicalUrl: string;
  rawTitle: string | null;
  rawText: string | null;
  rawMetadata: Record<string, unknown>;
  publishedAt: Date | null;
}

export interface FetcherConfig {
  sourceId: string;
  baseUrl: string;
  apiType: string;
  lastPolledAt: Date | null;
}
