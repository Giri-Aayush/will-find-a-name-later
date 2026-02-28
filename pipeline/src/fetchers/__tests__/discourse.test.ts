import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockLogger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../../utils/logger.js', () => ({ logger: mocks.mockLogger }));

import { DiscourseFetcher } from '../discourse.js';
import type { FetcherConfig } from '@hexcast/shared';

function createFetcher(overrides: Partial<FetcherConfig> = {}): DiscourseFetcher {
  return new DiscourseFetcher({
    sourceId: 'ethereum-magicians',
    baseUrl: 'https://ethereum-magicians.org',
    apiType: 'discourse',
    lastPolledAt: null,
    ...overrides,
  });
}

function makeTopic(overrides: Record<string, any> = {}) {
  return {
    id: 1001,
    title: 'EIP-7702 Discussion',
    slug: 'eip-7702-discussion',
    created_at: '2024-06-01T10:00:00Z',
    last_posted_at: '2024-06-01T12:00:00Z',
    views: 150,
    like_count: 10,
    reply_count: 5,
    posts_count: 6,
    category_id: 3,
    posters: [{ user_id: 1, description: 'Original Poster' }],
    ...overrides,
  };
}

function makeTopicDetail(overrides: Record<string, any> = {}) {
  return {
    post_stream: {
      posts: [
        {
          cooked: '<p>This is the <b>first post</b> content.</p>',
          username: 'vitalik',
          name: 'Vitalik Buterin',
          ...overrides,
        },
      ],
    },
  };
}

function mockJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  };
}

describe('DiscourseFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mocks.mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches latest topics and returns results', async () => {
    // Page 1: latest.json
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic()],
          more_topics_url: null,
        },
      }),
    );

    // Topic detail fetch
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse(makeTopicDetail()),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].sourceId).toBe('ethereum-magicians');
    expect(results[0].canonicalUrl).toBe(
      'https://ethereum-magicians.org/t/eip-7702-discussion/1001',
    );
    expect(results[0].rawTitle).toBe('EIP-7702 Discussion');
    // HTML should be stripped
    expect(results[0].rawText).toBe('This is the first post content.');
    expect(results[0].rawMetadata).toEqual(
      expect.objectContaining({
        topic_id: 1001,
        views: 150,
        like_count: 10,
        reply_count: 5,
        posts_count: 6,
        category_id: 3,
        author_username: 'vitalik',
        author_name: 'Vitalik Buterin',
      }),
    );
    expect(results[0].publishedAt).toEqual(new Date('2024-06-01T10:00:00Z'));
  });

  it('paginates up to MAX_PAGES (3)', async () => {
    // Page 1
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic({ id: 1, slug: 'topic-1' })],
          more_topics_url: '/latest?page=1',
        },
      }),
    );
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    // Page 2
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic({ id: 2, slug: 'topic-2' })],
          more_topics_url: '/latest?page=2',
        },
      }),
    );
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    // Page 3
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic({ id: 3, slug: 'topic-3' })],
          more_topics_url: '/latest?page=3',
        },
      }),
    );
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(3);
    // Should not fetch page 4 even though more_topics_url exists for page 3
  });

  it('stops when no more_topics_url', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic()],
          more_topics_url: undefined,
        },
      }),
    );
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    // Only 2 calls: listing page + 1 topic detail
    expect(mocks.mockFetch).toHaveBeenCalledTimes(2);
  });

  it('stops when no new topics on page', async () => {
    // All topics are before lastPolledAt
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [
            makeTopic({
              created_at: '2024-01-01T00:00:00Z',
              last_posted_at: '2024-01-01T00:00:00Z',
            }),
          ],
          more_topics_url: '/latest?page=1',
        },
      }),
    );

    const fetcher = createFetcher({
      lastPolledAt: new Date('2024-06-01T00:00:00Z'),
    });
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    // Should only make 1 call (listing page), no topic detail calls, and no page 2
    expect(mocks.mockFetch).toHaveBeenCalledTimes(1);
  });

  it('skips topics before lastPolledAt', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [
            makeTopic({
              id: 1,
              slug: 'old-topic',
              title: 'Old Topic',
              created_at: '2024-01-01T00:00:00Z',
              last_posted_at: '2024-01-02T00:00:00Z',
            }),
            makeTopic({
              id: 2,
              slug: 'new-topic',
              title: 'New Topic',
              created_at: '2024-07-01T00:00:00Z',
              last_posted_at: '2024-07-01T12:00:00Z',
            }),
          ],
          more_topics_url: null,
        },
      }),
    );

    // Only the new topic fetches detail
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    const fetcher = createFetcher({
      lastPolledAt: new Date('2024-06-01T00:00:00Z'),
    });
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawTitle).toBe('New Topic');
  });

  it('fetches topic detail for each new topic', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [
            makeTopic({ id: 10, slug: 'topic-a', title: 'Topic A' }),
            makeTopic({ id: 11, slug: 'topic-b', title: 'Topic B' }),
          ],
          more_topics_url: null,
        },
      }),
    );

    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        post_stream: {
          posts: [{ cooked: '<p>Content A</p>', username: 'alice', name: 'Alice' }],
        },
      }),
    );

    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        post_stream: {
          posts: [{ cooked: '<p>Content B</p>', username: 'bob', name: 'Bob' }],
        },
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(2);
    // 1 listing call + 2 detail calls
    expect(mocks.mockFetch).toHaveBeenCalledTimes(3);
    expect(results[0].rawText).toBe('Content A');
    expect(results[1].rawText).toBe('Content B');
  });

  it('skips topic when detail fetch fails', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [
            makeTopic({ id: 20, slug: 'good-topic', title: 'Good Topic' }),
            makeTopic({ id: 21, slug: 'bad-topic', title: 'Bad Topic' }),
          ],
          more_topics_url: null,
        },
      }),
    );

    // First topic detail succeeds
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    // Second topic detail fails
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(null, 404));

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawTitle).toBe('Good Topic');
    expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch topic 21'),
    );
  });

  it('uses lastPostedAt vs createdAt (whichever is newer) for relevance check', async () => {
    // Topic with old created_at but recent last_posted_at
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [
            makeTopic({
              id: 30,
              slug: 'revived-topic',
              title: 'Revived Topic',
              created_at: '2023-01-01T00:00:00Z',
              last_posted_at: '2024-07-15T00:00:00Z',
            }),
          ],
          more_topics_url: null,
        },
      }),
    );

    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    const fetcher = createFetcher({
      lastPolledAt: new Date('2024-06-01T00:00:00Z'),
    });
    const results = await fetcher.fetch();

    // Should be included because last_posted_at > lastPolledAt even though created_at is old
    expect(results).toHaveLength(1);
    expect(results[0].rawTitle).toBe('Revived Topic');
  });

  it('strips HTML from cooked content', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic()],
          more_topics_url: null,
        },
      }),
    );

    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        post_stream: {
          posts: [
            {
              cooked:
                '<p>Hello &amp; welcome to <b>Ethereum</b>!</p><br><ul><li>Item &lt;1&gt;</li></ul>',
              username: 'test',
              name: 'Test User',
            },
          ],
        },
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toHaveLength(1);
    expect(results[0].rawText).not.toContain('<p>');
    expect(results[0].rawText).not.toContain('<b>');
    expect(results[0].rawText).not.toContain('&amp;');
    expect(results[0].rawText).toContain('Hello & welcome to Ethereum');
    expect(results[0].rawText).toContain('Item <1>');
  });

  it('handles fetch error gracefully on listing page', async () => {
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(null, 500));

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    expect(mocks.mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch'),
    );
  });

  it('handles fetch throwing on listing page', async () => {
    mocks.mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
    expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed to parse response'),
    );
  });

  it('skips topic when first post is missing from detail', async () => {
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic({ id: 40, slug: 'empty-topic', title: 'Empty Topic' })],
          more_topics_url: null,
        },
      }),
    );

    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        post_stream: { posts: [] },
      }),
    );

    const fetcher = createFetcher();
    const results = await fetcher.fetch();

    expect(results).toEqual([]);
  });

  it('constructs correct URLs for pagination', async () => {
    // Page 1
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic({ id: 1, slug: 'p1' })],
          more_topics_url: '/latest?page=1',
        },
      }),
    );
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    // Page 2 - stops here
    mocks.mockFetch.mockResolvedValueOnce(
      mockJsonResponse({
        topic_list: {
          topics: [makeTopic({ id: 2, slug: 'p2' })],
          more_topics_url: null,
        },
      }),
    );
    mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(makeTopicDetail()));

    const fetcher = createFetcher();
    await fetcher.fetch();

    // First call: /latest.json
    expect(mocks.mockFetch.mock.calls[0][0]).toBe(
      'https://ethereum-magicians.org/latest.json',
    );
    // Third call (after topic detail): /latest.json?page=1
    expect(mocks.mockFetch.mock.calls[2][0]).toBe(
      'https://ethereum-magicians.org/latest.json?page=1',
    );
  });
});
