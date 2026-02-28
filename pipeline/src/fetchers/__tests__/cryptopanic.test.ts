import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockLogger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
  mockLoadConfig: vi.fn(),
}));

vi.mock('../../config.js', () => ({
  loadConfig: mocks.mockLoadConfig,
}));

vi.mock('../../utils/logger.js', () => ({ logger: mocks.mockLogger }));

import { CryptoPanicFetcher } from '../cryptopanic.js';
import type { FetcherConfig } from '@hexcast/shared';

function createFetcher(overrides: Partial<FetcherConfig> = {}): CryptoPanicFetcher {
  return new CryptoPanicFetcher({
    sourceId: 'cryptopanic.com/trending',
    baseUrl: 'https://cryptopanic.com',
    apiType: 'cryptopanic',
    lastPolledAt: null,
    ...overrides,
  });
}

function mockJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

function makePost(overrides: Record<string, any> = {}) {
  return {
    title: 'Bitcoin hits new high',
    description: 'BTC surges past $100k',
    published_at: '2024-06-01T12:00:00Z',
    created_at: '2024-06-01T12:00:00Z',
    kind: 'news',
    ...overrides,
  };
}

describe('CryptoPanicFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mocks.mockFetch);
    mocks.mockLoadConfig.mockReturnValue({
      cryptoPanicApiKey: 'test-api-key',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty array when API key not set', async () => {
    mocks.mockLoadConfig.mockReturnValue({ cryptoPanicApiKey: '' });

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('CRYPTOPANIC_API_KEY not set'),
    );
    expect(mocks.mockFetch).not.toHaveBeenCalled();
  });

  it('returns empty array for unknown source ID (no FILTER_MAP entry)', async () => {
    const fetcher = createFetcher({ sourceId: 'cryptopanic.com/unknown' });
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Unknown CryptoPanic source'),
    );
  });

  it('fetches posts and returns FetchResult array', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        results: [makePost(), makePost({ title: 'ETH update', description: 'ETH news' })],
        next: null,
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(2);
    expect(results[0].sourceId).toBe('cryptopanic.com/trending');
    expect(results[0].rawTitle).toBe('Bitcoin hits new high');
    expect(results[0].rawText).toBe('BTC surges past $100k');
    expect(results[0].rawMetadata).toEqual({ kind: 'news', filter: 'trending' });
    expect(results[0].publishedAt).toEqual(new Date('2024-06-01T12:00:00Z'));
  });

  it('stops on 429 rate limit', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse(null, 429),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Rate limited (429)'),
    );
  });

  it('stops on non-OK response', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse(null, 500),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    expect(mocks.mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('API error 500'),
    );
  });

  it('stops when no results in response', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({ results: [], next: 'https://next-page' }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
  });

  it('stops when results is null', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({ results: null, next: null }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
  });

  it('respects MAX_ITEMS (50) limit', async () => {
    // First page: 30 items
    const page1Posts = Array.from({ length: 30 }, (_, i) =>
      makePost({ title: `Post ${i}`, published_at: '2024-06-01T12:00:00Z' }),
    );
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({ results: page1Posts, next: 'https://next-page' }),
    );

    // Second page: 30 more items (but should stop at 50 total)
    const page2Posts = Array.from({ length: 30 }, (_, i) =>
      makePost({ title: `Post ${30 + i}`, published_at: '2024-06-01T12:00:00Z' }),
    );
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({ results: page2Posts, next: 'https://next-page-2' }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(50);
  });

  it('skips items before lastPolledAt', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        results: [
          makePost({ title: 'Old post', published_at: '2024-01-01T00:00:00Z' }),
          makePost({ title: 'New post', published_at: '2024-06-15T00:00:00Z' }),
        ],
        next: null,
      }),
    );

    const fetcher = createFetcher({
      lastPolledAt: new Date('2024-06-01T00:00:00Z'),
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawTitle).toBe('New post');
  });

  it('uses description, falls back to title for rawText', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        results: [
          makePost({ title: 'No desc', description: null }),
          makePost({ title: 'Has desc', description: 'A description' }),
        ],
        next: null,
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(2);
    expect(results[0].rawText).toBe('No desc'); // falls back to title
    expect(results[1].rawText).toBe('A description');
  });

  it('generates canonical URL from title', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        results: [makePost({ title: 'Bitcoin Price Analysis' })],
        next: null,
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results[0].canonicalUrl).toContain('https://cryptopanic.com/news?search=');
    expect(results[0].canonicalUrl).toContain(
      encodeURIComponent('Bitcoin Price Analysis'),
    );
  });

  it('truncates title to 80 chars for canonical URL', async () => {
    const longTitle = 'A'.repeat(120);
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        results: [makePost({ title: longTitle })],
        next: null,
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    const searchParam = decodeURIComponent(
      results[0].canonicalUrl.split('search=')[1],
    );
    expect(searchParam.length).toBe(80);
  });

  it('handles fetch() throwing', async () => {
    mocks.mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    expect(mocks.mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Fetch error'),
      expect.any(Error),
    );
  });

  it('paginates when next URL is provided', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        results: [makePost({ title: 'Page 1 Post' })],
        next: 'https://cryptopanic.com/api/developer/v2/posts/?page=2',
      }),
    );

    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        results: [makePost({ title: 'Page 2 Post' })],
        next: null,
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(2);
    expect(results[0].rawTitle).toBe('Page 1 Post');
    expect(results[1].rawTitle).toBe('Page 2 Post');
    expect(mocks.mockFetch).toHaveBeenCalledTimes(2);
  });

  it('uses correct filter for each sourceId', async () => {
    for (const [sourceId, expectedFilter] of [
      ['cryptopanic.com/trending', 'trending'],
      ['cryptopanic.com/hot', 'hot'],
      ['cryptopanic.com/rising', 'rising'],
    ] as const) {
      vi.clearAllMocks();
      mocks.mockLoadConfig.mockReturnValue({ cryptoPanicApiKey: 'test-key' });

      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          results: [makePost()],
          next: null,
        }),
      );

      const fetcher = createFetcher({ sourceId });
      const results = await fetcher.fetch();

      expect(results[0].rawMetadata.filter).toBe(expectedFilter);
    }
  });
});
