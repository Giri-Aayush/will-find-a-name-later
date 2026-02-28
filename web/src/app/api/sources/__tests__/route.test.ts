import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks (before route import) ---

vi.mock('@/lib/queries', () => ({
  getSources: vi.fn(),
}));

import { GET } from '../route';
import { getSources } from '@/lib/queries';

const mockGetSources = vi.mocked(getSources);

// --- Setup ---

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSources.mockResolvedValue([]);
});

// --- Tests ---

describe('GET /api/sources', () => {
  it('returns 200 with sources array on success', async () => {
    const sources = [
      { id: 'src1', display_name: 'EthResearch', is_active: true },
      { id: 'src2', display_name: 'Ethereum Magicians', is_active: true },
    ];
    mockGetSources.mockResolvedValue(sources as any);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.sources).toEqual(sources);
    expect(json.sources).toHaveLength(2);
  });

  it('returns 200 with empty array when no sources', async () => {
    mockGetSources.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.sources).toEqual([]);
  });

  it('returns 500 when getSources throws', async () => {
    mockGetSources.mockRejectedValue(new Error('Failed to fetch sources: DB down'));

    const res = await GET();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe('Failed to fetch sources');
  });
});
