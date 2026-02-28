import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { state, mockSupabase } = vi.hoisted(() => {
  const state = { fromCallIndex: 0, chainResults: [] as any[] };

  function makeChain() {
    const chain: Record<string, any> = {};
    const methods = ['select', 'insert', 'update', 'eq', 'gt', 'lt', 'single'];
    for (const m of methods) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    const idx = state.fromCallIndex++;
    chain.then = (resolve: any) => resolve(state.chainResults[idx] ?? { data: null, error: null });
    chain.single = vi.fn().mockImplementation(() => {
      return Promise.resolve(state.chainResults[idx] ?? { data: null, error: null });
    });
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

import { acquireLock, releaseLock } from '../pipeline-lock.js';
import { logger } from '../../utils/logger.js';

describe('acquireLock', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('returns run ID when no active runs exist', async () => {
    state.chainResults[0] = { data: [], error: null };                    // active runs check
    state.chainResults[1] = { data: [], error: null };                    // stale runs check
    state.chainResults[2] = { data: { id: 'run-abc' }, error: null };    // insert new run

    const result = await acquireLock();
    expect(result).toBe('run-abc');
    expect(mockSupabase.from).toHaveBeenCalledWith('pipeline_runs');
  });

  it('returns null when active non-stale run exists', async () => {
    const recentStartTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
    state.chainResults[0] = {
      data: [{ id: 'existing-run', status: 'running', started_at: recentStartTime }],
      error: null,
    };

    const result = await acquireLock();
    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Pipeline lock held by run existing-run')
    );
  });

  it('auto-expires stale runs and acquires lock', async () => {
    state.chainResults[0] = { data: [], error: null };                           // no active runs
    state.chainResults[1] = { data: [{ id: 'stale-run-1' }], error: null };     // one stale run
    state.chainResults[2] = { data: null, error: null };                         // update stale run
    state.chainResults[3] = { data: { id: 'new-run' }, error: null };           // insert new run

    const result = await acquireLock();
    expect(result).toBe('new-run');
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Auto-expired stale pipeline run: stale-run-1')
    );
  });

  it('returns null when insert fails', async () => {
    state.chainResults[0] = { data: [], error: null };       // active runs check
    state.chainResults[1] = { data: [], error: null };       // stale runs check
    state.chainResults[2] = { data: null, error: { message: 'insert failed' } }; // insert fails

    const result = await acquireLock();
    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to acquire pipeline lock'),
      expect.anything()
    );
  });

  it('uses GITHUB_RUN_ID as runner_id when set', async () => {
    const originalRunId = process.env.GITHUB_RUN_ID;
    process.env.GITHUB_RUN_ID = 'gh-run-42';

    state.chainResults[0] = { data: [], error: null };
    state.chainResults[1] = { data: [], error: null };
    state.chainResults[2] = { data: { id: 'run-with-gh' }, error: null };

    const result = await acquireLock();
    expect(result).toBe('run-with-gh');
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('runner: gh-run-42')
    );

    // Restore
    if (originalRunId !== undefined) {
      process.env.GITHUB_RUN_ID = originalRunId;
    } else {
      delete process.env.GITHUB_RUN_ID;
    }
  });
});

describe('releaseLock', () => {
  beforeEach(() => {
    state.fromCallIndex = 0;
    state.chainResults.length = 0;
    vi.clearAllMocks();
  });

  it('updates run with completed status', async () => {
    state.chainResults[0] = { data: null, error: null };

    await releaseLock('run-123', {
      status: 'completed',
      itemsFetched: 10,
      cardsCreated: 8,
      cardsSkipped: 2,
      cardsFailed: 0,
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('pipeline_runs');
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Pipeline lock released: run-123 (completed)')
    );
  });

  it('updates run with failed status and error', async () => {
    state.chainResults[0] = { data: null, error: null };

    await releaseLock('run-456', {
      status: 'failed',
      errorMessage: 'Something went wrong',
    });

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Pipeline lock released: run-456 (failed)')
    );
  });

  it('logs error when update fails', async () => {
    state.chainResults[0] = { data: null, error: { message: 'update failed' } };

    await releaseLock('run-789', { status: 'completed' });

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to release pipeline lock run-789'),
      expect.anything()
    );
  });
});
