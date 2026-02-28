import { describe, it, expect, vi, beforeEach } from 'vitest';

const { state, mockSupabase } = vi.hoisted(() => {
  const state = { fromCallIndex: 0, chainResults: [] as any[] };

  function makeChain(): any {
    const chain: any = {};
    ['select', 'eq', 'order', 'limit', 'range', 'upsert', 'update', 'lt', 'maybeSingle', 'insert'].forEach((m) => {
      chain[m] = vi.fn().mockReturnValue(chain);
    });
    const idx = state.fromCallIndex++;
    chain.then = (resolve: any) => {
      const result = state.chainResults[idx] ?? { data: null, error: null };
      return resolve(result);
    };
    return chain;
  }

  const mockSupabase = {
    from: vi.fn().mockImplementation(() => makeChain()),
  };

  return { state, mockSupabase };
});

vi.mock('../client.js', () => ({ supabase: mockSupabase }));

import { insertRawItem, getUnprocessedItems, markAsProcessed } from '../raw-items.js';
import type { FetchResult } from '@hexcast/shared';

describe('insertRawItem', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  const sampleResult: FetchResult = {
    sourceId: 'blog.ethereum.org',
    canonicalUrl: 'https://blog.ethereum.org/2024/01/test',
    rawTitle: 'Test Article',
    rawText: 'Article content here',
    rawMetadata: { author: 'alice', categories: ['tech'] },
    publishedAt: new Date('2024-01-15T10:00:00Z'),
  };

  it('succeeds on the happy path', async () => {
    state.chainResults[0] = { data: null, error: null };

    await expect(insertRawItem(sampleResult)).resolves.toBeUndefined();
    expect(mockSupabase.from).toHaveBeenCalledWith('raw_items');
  });

  it('throws on DB error', async () => {
    state.chainResults[0] = {
      data: null,
      error: { message: 'unique violation' },
    };

    await expect(insertRawItem(sampleResult)).rejects.toThrow(
      'Failed to insert raw item https://blog.ethereum.org/2024/01/test: unique violation',
    );
  });

  it('handles null publishedAt', async () => {
    state.chainResults[0] = { data: null, error: null };

    const resultWithNullDate: FetchResult = {
      ...sampleResult,
      publishedAt: null,
    };

    await expect(insertRawItem(resultWithNullDate)).resolves.toBeUndefined();
    expect(mockSupabase.from).toHaveBeenCalledWith('raw_items');
  });
});

describe('getUnprocessedItems', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('returns items from single page', async () => {
    const mockItems = [
      { id: '1', source_id: 'test', canonical_url: 'https://example.com/1', processed: false },
      { id: '2', source_id: 'test', canonical_url: 'https://example.com/2', processed: false },
    ];
    state.chainResults[0] = { data: mockItems, error: null };

    const results = await getUnprocessedItems();

    expect(results).toEqual(mockItems);
    expect(results).toHaveLength(2);
    expect(mockSupabase.from).toHaveBeenCalledWith('raw_items');
  });

  it('paginates across multiple pages', async () => {
    // First page: exactly 1000 items (PAGE_SIZE) to trigger pagination
    const page1Items = Array.from({ length: 1000 }, (_, i) => ({
      id: `p1-${i}`,
      source_id: 'test',
      canonical_url: `https://example.com/p1-${i}`,
      processed: false,
    }));
    state.chainResults[0] = { data: page1Items, error: null };

    // Second page: less than PAGE_SIZE items (pagination stops)
    const page2Items = Array.from({ length: 50 }, (_, i) => ({
      id: `p2-${i}`,
      source_id: 'test',
      canonical_url: `https://example.com/p2-${i}`,
      processed: false,
    }));
    state.chainResults[1] = { data: page2Items, error: null };

    const results = await getUnprocessedItems();

    expect(results).toHaveLength(1050);
    expect(mockSupabase.from).toHaveBeenCalledTimes(2);
  });

  it('returns empty array when no items', async () => {
    state.chainResults[0] = { data: [], error: null };

    const results = await getUnprocessedItems();

    expect(results).toEqual([]);
  });

  it('returns empty array when data is null', async () => {
    state.chainResults[0] = { data: null, error: null };

    const results = await getUnprocessedItems();

    expect(results).toEqual([]);
  });

  it('throws on DB error', async () => {
    state.chainResults[0] = {
      data: null,
      error: { message: 'connection refused' },
    };

    await expect(getUnprocessedItems()).rejects.toThrow(
      'Failed to fetch unprocessed items: connection refused',
    );
  });
});

describe('markAsProcessed', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('succeeds on the happy path', async () => {
    state.chainResults[0] = { data: null, error: null };

    await expect(markAsProcessed('item-uuid-123')).resolves.toBeUndefined();
    expect(mockSupabase.from).toHaveBeenCalledWith('raw_items');
  });

  it('throws on DB error', async () => {
    state.chainResults[0] = {
      data: null,
      error: { message: 'row not found' },
    };

    await expect(markAsProcessed('item-uuid-123')).rejects.toThrow(
      'Failed to mark item item-uuid-123 as processed: row not found',
    );
  });
});
