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

import { getActiveSources, updateLastPolledAt } from '../sources.js';

describe('getActiveSources', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('returns sources without filter', async () => {
    const mockSources = [
      { id: 's1', source_id: 'blog.ethereum.org', api_type: 'rss', is_active: true },
      { id: 's2', source_id: 'ethresear.ch', api_type: 'discourse', is_active: true },
    ];
    state.chainResults[0] = { data: mockSources, error: null };

    const results = await getActiveSources();

    expect(results).toEqual(mockSources);
    expect(results).toHaveLength(2);
    expect(mockSupabase.from).toHaveBeenCalledWith('source_registry');
  });

  it('applies apiTypeFilter', async () => {
    const mockSources = [
      { id: 's1', source_id: 'blog.ethereum.org', api_type: 'rss', is_active: true },
    ];
    state.chainResults[0] = { data: mockSources, error: null };

    const results = await getActiveSources('rss');

    expect(results).toEqual(mockSources);
    expect(mockSupabase.from).toHaveBeenCalledWith('source_registry');
  });

  it('ignores "all" filter (treats same as no filter)', async () => {
    const mockSources = [
      { id: 's1', source_id: 'blog.ethereum.org', api_type: 'rss', is_active: true },
      { id: 's2', source_id: 'ethresear.ch', api_type: 'discourse', is_active: true },
    ];
    state.chainResults[0] = { data: mockSources, error: null };

    const results = await getActiveSources('all');

    expect(results).toEqual(mockSources);
  });

  it('throws on DB error', async () => {
    state.chainResults[0] = {
      data: null,
      error: { message: 'connection timeout' },
    };

    await expect(getActiveSources()).rejects.toThrow(
      'Failed to fetch sources: connection timeout',
    );
  });

  it('returns empty array when data is null', async () => {
    state.chainResults[0] = { data: null, error: null };

    const results = await getActiveSources();

    expect(results).toEqual([]);
  });

  it('returns empty array when no active sources', async () => {
    state.chainResults[0] = { data: [], error: null };

    const results = await getActiveSources();

    expect(results).toEqual([]);
  });
});

describe('updateLastPolledAt', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('succeeds on the happy path', async () => {
    state.chainResults[0] = { data: null, error: null };

    await expect(updateLastPolledAt('source-uuid-123')).resolves.toBeUndefined();
    expect(mockSupabase.from).toHaveBeenCalledWith('source_registry');
  });

  it('throws on DB error', async () => {
    state.chainResults[0] = {
      data: null,
      error: { message: 'source not found' },
    };

    await expect(updateLastPolledAt('source-uuid-123')).rejects.toThrow(
      'Failed to update last_polled_at for source-uuid-123: source not found',
    );
  });
});
