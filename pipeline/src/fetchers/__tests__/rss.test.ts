import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockParseURL: vi.fn(),
  mockFetch: vi.fn(),
  mockLogger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('rss-parser', () => {
  const MockRssParser = function (this: any) {
    this.parseURL = mocks.mockParseURL;
  };
  return { default: MockRssParser };
});

vi.mock('../../utils/logger.js', () => ({ logger: mocks.mockLogger }));

import { RssFetcher } from '../rss.js';
import type { FetcherConfig } from '@hexcast/shared';

function createFetcher(overrides: Partial<FetcherConfig> = {}): RssFetcher {
  return new RssFetcher({
    sourceId: 'blog.ethereum.org',
    baseUrl: 'https://blog.ethereum.org',
    apiType: 'rss',
    lastPolledAt: null,
    ...overrides,
  });
}

describe('RssFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mocks.mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty array for unknown sourceId (no RSS_FEEDS entry)', async () => {
    const fetcher = createFetcher({ sourceId: 'unknown.example.com' });
    const results = await fetcher.fetch();
    expect(results).toEqual([]);
    expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('No RSS feed URL configured for unknown.example.com'),
    );
  });

  it('returns parsed items from feed', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Test Post',
          link: 'https://blog.ethereum.org/2024/01/test',
          pubDate: '2024-01-15T12:00:00Z',
          contentSnippet: 'Article content here',
          guid: 'guid-1',
          categories: ['tech'],
        },
      ],
    });

    // blog.ethereum.org is a SCRAPE_SOURCE, so it will call fetch for the article
    mocks.mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html><body><article>Full article text here for testing.</article></body></html>'),
    });

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].sourceId).toBe('blog.ethereum.org');
    expect(results[0].canonicalUrl).toBe('https://blog.ethereum.org/2024/01/test');
    expect(results[0].rawTitle).toBe('Test Post');
    expect(results[0].publishedAt).toEqual(new Date('2024-01-15T12:00:00Z'));
  });

  it('skips items before lastPolledAt', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Old Post',
          link: 'https://blog.ethereum.org/old',
          pubDate: '2024-01-10T00:00:00Z',
          contentSnippet: 'Old content',
        },
        {
          title: 'New Post',
          link: 'https://blog.ethereum.org/new',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: 'New content',
        },
      ],
    });

    // Only the new post should trigger a scrape (SCRAPE_SOURCE)
    mocks.mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html><body><article>New article full text content here.</article></body></html>'),
    });

    const fetcher = createFetcher({
      lastPolledAt: new Date('2024-01-15T00:00:00Z'),
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawTitle).toBe('New Post');
  });

  it('limits to MAX_ITEMS_PER_FETCH (30)', async () => {
    const items = Array.from({ length: 40 }, (_, i) => ({
      title: `Post ${i}`,
      link: `https://blog.ethereum.org/post-${i}`,
      pubDate: '2024-06-01T00:00:00Z',
      contentSnippet: `Content ${i}`,
    }));

    mocks.mockParseURL.mockResolvedValueOnce({ items });

    // Each item triggers a scrape call for blog.ethereum.org (SCRAPE_SOURCE)
    for (let i = 0; i < 30; i++) {
      mocks.mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve(
            `<html><body><article>Full article text number ${i} with enough length to pass.</article></body></html>`,
          ),
      });
    }

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(30);
  });

  it('handles null pubDate and isoDate gracefully (includes item)', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'No Date Post',
          link: 'https://blog.ethereum.org/no-date',
          pubDate: null,
          isoDate: null,
          contentSnippet: 'Content without dates',
        },
      ],
    });

    mocks.mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          '<html><body><article>Scraped article text content for no date post.</article></body></html>',
        ),
    });

    const fetcher = createFetcher({
      lastPolledAt: new Date('2024-01-15T00:00:00Z'),
    });
    const results = await fetcher.fetch();

    // null date -> isAfterLastPoll returns true
    expect(results).toHaveLength(1);
    expect(results[0].publishedAt).toBeNull();
  });

  it('falls back to isoDate when pubDate is null', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'ISO Date Post',
          link: 'https://blog.ethereum.org/iso-date',
          pubDate: null,
          isoDate: '2024-02-01T08:00:00Z',
          contentSnippet: 'With isoDate',
        },
      ],
    });

    mocks.mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          '<html><body><article>Article text for the iso date post content.</article></body></html>',
        ),
    });

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].publishedAt).toEqual(new Date('2024-02-01T08:00:00Z'));
  });

  it('replaces vitalik.ca with vitalik.eth.limo in links', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Vitalik Post',
          link: 'https://vitalik.ca/general/2024/01/test.html',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: 'Vitalik content',
        },
      ],
    });

    mocks.mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          '<html><body><div class="post-content">Full vitalik article text content.</div></body></html>',
        ),
    });

    const fetcher = createFetcher({ sourceId: 'vitalik.eth.limo' });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].canonicalUrl).toBe(
      'https://vitalik.eth.limo/general/2024/01/test.html',
    );
    expect(results[0].canonicalUrl).not.toContain('vitalik.ca');
  });

  it('skips items without link', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'No Link Post',
          link: undefined,
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: 'No link here',
        },
        {
          title: 'Has Link Post',
          link: 'https://blog.ethereum.org/has-link',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: 'Has a link',
        },
      ],
    });

    mocks.mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          '<html><body><article>Full text for the post that has a link.</article></body></html>',
        ),
    });

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawTitle).toBe('Has Link Post');
  });

  it('uses contentSnippet for non-SCRAPE_SOURCES', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Substack Post',
          link: 'https://christinedkim.substack.com/p/test',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: 'The content snippet text',
          content: 'The full content',
          summary: 'The summary',
        },
      ],
    });

    const fetcher = createFetcher({
      sourceId: 'christinedkim.substack.com',
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawText).toBe('The content snippet text');
    // fetch should NOT be called since this is not a SCRAPE_SOURCE
    expect(mocks.mockFetch).not.toHaveBeenCalled();
  });

  it('falls back to content:encoded, then content, then summary for feed text', async () => {
    // Test fallback to content
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Fallback Post',
          link: 'https://christinedkim.substack.com/p/fallback',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: undefined,
          'content:encoded': 'Encoded content',
          content: 'Plain content',
          summary: 'Summary text',
        },
      ],
    });

    const fetcher = createFetcher({
      sourceId: 'christinedkim.substack.com',
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    // contentSnippet is undefined, so falls to content:encoded
    expect(results[0].rawText).toBe('Encoded content');
  });

  it('falls back to content when contentSnippet and content:encoded are missing', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Content Fallback',
          link: 'https://christinedkim.substack.com/p/content-fallback',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: undefined,
          content: 'Plain content fallback',
          summary: 'Summary text',
        },
      ],
    });

    const fetcher = createFetcher({
      sourceId: 'christinedkim.substack.com',
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawText).toBe('Plain content fallback');
  });

  it('falls back to summary when contentSnippet and content are missing', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Summary Fallback',
          link: 'https://christinedkim.substack.com/p/summary-fallback',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: undefined,
          content: undefined,
          summary: 'Summary fallback text',
        },
      ],
    });

    const fetcher = createFetcher({
      sourceId: 'christinedkim.substack.com',
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawText).toBe('Summary fallback text');
  });

  it('returns null rawText when no content fields are present (non-SCRAPE)', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Empty Content',
          link: 'https://christinedkim.substack.com/p/empty',
          pubDate: '2024-01-20T00:00:00Z',
        },
      ],
    });

    const fetcher = createFetcher({
      sourceId: 'christinedkim.substack.com',
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawText).toBeNull();
  });

  it('scrapes article for SCRAPE_SOURCES (blog.ethereum.org)', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'EF Blog Post',
          link: 'https://blog.ethereum.org/2024/01/update',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: 'Just an excerpt',
        },
      ],
    });

    mocks.mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          '<html><body><article>This is the full scraped article text from the Ethereum Foundation blog post.</article></body></html>',
        ),
    });

    const fetcher = createFetcher({ sourceId: 'blog.ethereum.org' });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    // Should use scraped content, not the snippet
    expect(results[0].rawText).toContain('full scraped article text');
    expect(mocks.mockFetch).toHaveBeenCalledWith(
      'https://blog.ethereum.org/2024/01/update',
    );
  });

  it('returns null for rawText when scrape fails (non-ok response)', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Failed Scrape',
          link: 'https://blog.ethereum.org/2024/01/fail',
          pubDate: '2024-01-20T00:00:00Z',
        },
      ],
    });

    mocks.mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const fetcher = createFetcher({ sourceId: 'blog.ethereum.org' });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawText).toBeNull();
  });

  it('returns null for rawText when scrape throws', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Error Scrape',
          link: 'https://blog.ethereum.org/2024/01/error',
          pubDate: '2024-01-20T00:00:00Z',
        },
      ],
    });

    mocks.mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const fetcher = createFetcher({ sourceId: 'blog.ethereum.org' });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawText).toBeNull();
  });

  it('populates rawMetadata with guid, author, and categories', async () => {
    mocks.mockParseURL.mockResolvedValueOnce({
      items: [
        {
          title: 'Metadata Post',
          link: 'https://christinedkim.substack.com/p/meta',
          pubDate: '2024-01-20T00:00:00Z',
          contentSnippet: 'Some content',
          guid: 'guid-abc',
          creator: 'Author Name',
          categories: ['ethereum', 'governance'],
        },
      ],
    });

    const fetcher = createFetcher({
      sourceId: 'christinedkim.substack.com',
    });
    const results = await fetcher.fetch();

    expect(results[0].rawMetadata).toEqual({
      guid: 'guid-abc',
      author: 'Author Name',
      categories: ['ethereum', 'governance'],
    });
  });
});
