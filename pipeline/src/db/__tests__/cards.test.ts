import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { state, mockSupabase } = vi.hoisted(() => {
  const state = { fromCallIndex: 0, chainResults: [] as any[] };

  function makeChain() {
    const chain: Record<string, any> = {};
    const methods = [
      'select', 'insert', 'update', 'upsert', 'delete',
      'eq', 'gte', 'lte', 'gt', 'lt', 'order', 'limit',
    ];
    for (const m of methods) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    const idx = state.fromCallIndex++;
    chain.single = vi.fn().mockResolvedValue(state.chainResults[idx] ?? { data: null, error: null });
    chain.maybeSingle = vi.fn().mockResolvedValue(state.chainResults[idx] ?? { data: null, error: null });
    chain.then = (resolve: any) => resolve(state.chainResults[idx] ?? { data: null, error: null });
    return chain;
  }

  const mockSupabase = {
    from: vi.fn().mockImplementation(() => makeChain()),
  };

  return { state, mockSupabase, makeChain };
});

vi.mock('../client.js', () => ({ supabase: mockSupabase }));
vi.mock('../../utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { createCard, findByUrlHash, findByTimeRange } from '../cards.js';

describe('createCard', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  const sampleParams = {
    sourceId: 'test-source',
    canonicalUrl: 'https://example.com/article',
    urlHash: 'abc123hash',
    category: 'GOVERNANCE' as const,
    headline: 'Test Headline',
    summary: 'A test summary',
    author: 'alice',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    engagement: null,
    pipelineVersion: '0.1.0',
  };

  it('inserts and returns ID', async () => {
    state.chainResults[0] = { data: { id: 'card-uuid-1' }, error: null };

    const id = await createCard(sampleParams);
    expect(id).toBe('card-uuid-1');
    expect(mockSupabase.from).toHaveBeenCalledWith('cards');
  });

  it('throws on error', async () => {
    state.chainResults[0] = { data: null, error: { message: 'duplicate key' } };

    await expect(createCard(sampleParams)).rejects.toThrow(
      'Failed to create card for https://example.com/article: duplicate key'
    );
  });
});

describe('findByUrlHash', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('returns card when found', async () => {
    const mockCard = {
      id: 'card-1',
      headline: 'Found Card',
      url_hash: 'hash123',
    };
    state.chainResults[0] = { data: mockCard, error: null };

    const result = await findByUrlHash('hash123');
    expect(result).toEqual(mockCard);
    expect(mockSupabase.from).toHaveBeenCalledWith('cards');
  });

  it('returns null when not found', async () => {
    state.chainResults[0] = { data: null, error: null };

    const result = await findByUrlHash('nonexistent-hash');
    expect(result).toBeNull();
  });
});

describe('findByTimeRange', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('returns cards in range', async () => {
    const mockCards = [
      { headline: 'Card A', published_at: '2024-01-15T10:00:00Z' },
      { headline: 'Card B', published_at: '2024-01-15T11:00:00Z' },
    ];
    state.chainResults[0] = { data: mockCards, error: null };

    const from = new Date('2024-01-15T09:00:00Z');
    const to = new Date('2024-01-15T12:00:00Z');
    const result = await findByTimeRange(from, to);
    expect(result).toEqual(mockCards);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no cards in range', async () => {
    state.chainResults[0] = { data: [], error: null };

    const from = new Date('2024-01-15T09:00:00Z');
    const to = new Date('2024-01-15T12:00:00Z');
    const result = await findByTimeRange(from, to);
    expect(result).toEqual([]);
  });

  it('returns empty array when data is null', async () => {
    state.chainResults[0] = { data: null, error: null };

    const from = new Date('2024-01-15T09:00:00Z');
    const to = new Date('2024-01-15T12:00:00Z');
    const result = await findByTimeRange(from, to);
    expect(result).toEqual([]);
  });

  it('calls with correct date range', async () => {
    state.chainResults[0] = { data: [], error: null };

    const from = new Date('2024-01-15T06:00:00Z');
    const to = new Date('2024-01-15T12:00:00Z');
    await findByTimeRange(from, to);

    expect(mockSupabase.from).toHaveBeenCalledWith('cards');
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);
  });

  it('throws on error', async () => {
    state.chainResults[0] = { data: null, error: { message: 'db connection failed' } };

    const from = new Date('2024-01-15T06:00:00Z');
    const to = new Date('2024-01-15T12:00:00Z');
    await expect(findByTimeRange(from, to)).rejects.toThrow(
      'Failed to find cards in time range: db connection failed'
    );
  });
});
