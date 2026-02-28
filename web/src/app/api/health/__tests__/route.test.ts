import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks (before route import) ---

const { mockChain, state } = vi.hoisted(() => {
  const mockChain: any = {};
  ['select', 'limit', 'from'].forEach((m) => {
    mockChain[m] = vi.fn().mockReturnValue(mockChain);
  });

  const state = { dbError: null as any };
  (mockChain as any).then = (resolve: any) =>
    resolve({ data: [{}], error: state.dbError });

  return { mockChain, state };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue(mockChain),
  }),
}));

import { GET } from '../route';

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks();
  state.dbError = null;
});

describe('GET /api/health', () => {
  it('returns 200 with "healthy" when DB check passes', async () => {
    state.dbError = null;

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('healthy');
    expect(json.checks.database).toBe('ok');
  });

  it('returns 503 with "degraded" when DB check fails', async () => {
    state.dbError = { message: 'fail' };

    const res = await GET();
    expect(res.status).toBe(503);

    const json = await res.json();
    expect(json.status).toBe('degraded');
    expect(json.checks.database).toBe('fail');
  });

  it('response includes timestamp', async () => {
    const res = await GET();
    const json = await res.json();

    expect(json.timestamp).toBeDefined();
    expect(typeof json.timestamp).toBe('string');
    // Ensure it's a valid ISO timestamp
    expect(new Date(json.timestamp).toISOString()).toBe(json.timestamp);
  });

  it('returns degraded when createClient itself throws an exception', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockImplementationOnce(() => {
      throw new Error('createClient exploded');
    });

    const res = await GET();
    expect(res.status).toBe(503);

    const json = await res.json();
    expect(json.status).toBe('degraded');
    expect(json.checks.database).toBe('fail');
  });
});
