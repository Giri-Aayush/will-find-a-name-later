import { vi } from 'vitest';

/**
 * Creates a mock Supabase client with fluent chainable query builder.
 * Every method returns the chain itself; terminal methods resolve to { data, error }.
 */
export function createMockSupabase() {
  const chainable = () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const methods = [
      'select', 'insert', 'update', 'upsert', 'delete',
      'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'in', 'is',
      'ilike', 'order', 'limit', 'range', 'single', 'maybeSingle',
      'onConflict', 'not', 'filter', 'match', 'or',
    ];
    for (const m of methods) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    (chain as any).then = (resolve: (v: any) => any) =>
      resolve({ data: null, error: null });

    return chain;
  };

  return {
    from: vi.fn().mockImplementation(() => chainable()),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
}

export type MockSupabase = ReturnType<typeof createMockSupabase>;
