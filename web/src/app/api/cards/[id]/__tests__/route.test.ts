import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks (before route import) ---

vi.mock('@/lib/queries', () => ({
  getCardById: vi.fn(),
}));

import { GET } from '../route';
import { getCardById } from '@/lib/queries';

const mockGetCardById = vi.mocked(getCardById);

// --- Helpers ---

function makeRequest(id: string) {
  return new NextRequest(new URL(`http://localhost:3000/api/cards/${id}`));
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// --- Setup ---

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCardById.mockResolvedValue(null);
});

// --- Tests ---

describe('GET /api/cards/[id]', () => {
  it('returns 200 with card data when found', async () => {
    const card = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      headline: 'EIP-4844 Analysis',
      summary: 'Deep dive into proto-danksharding',
      category: 'RESEARCH',
      source_id: 'ethresear_ch',
    };
    mockGetCardById.mockResolvedValue(card as any);

    const res = await GET(
      makeRequest('550e8400-e29b-41d4-a716-446655440000'),
      makeParams('550e8400-e29b-41d4-a716-446655440000'),
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(json.headline).toBe('EIP-4844 Analysis');
  });

  it('returns 400 for non-UUID id', async () => {
    const res = await GET(
      makeRequest('nonexistent-id'),
      makeParams('nonexistent-id'),
    );
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Invalid ID format');
  });

  it('returns 404 when card not found (getCardById returns null)', async () => {
    const uuid = '00000000-0000-0000-0000-000000000099';
    mockGetCardById.mockResolvedValue(null);

    const res = await GET(makeRequest(uuid), makeParams(uuid));
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.error).toBe('Card not found');
  });

  it('returns 500 when getCardById throws', async () => {
    const uuid = '00000000-0000-0000-0000-000000000088';
    mockGetCardById.mockRejectedValue(new Error('DB connection lost'));

    const res = await GET(makeRequest(uuid), makeParams(uuid));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe('Failed to fetch card');
  });

  it('works with valid UUID id', async () => {
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const card = { id: uuid, headline: 'Test Card' };
    mockGetCardById.mockResolvedValue(card as any);

    const res = await GET(makeRequest(uuid), makeParams(uuid));
    expect(res.status).toBe(200);

    expect(mockGetCardById).toHaveBeenCalledWith(uuid);
  });

  it('rejects arbitrary string id with 400', async () => {
    const arbitraryId = 'not-a-uuid-just-a-string';

    const res = await GET(
      makeRequest(arbitraryId),
      makeParams(arbitraryId),
    );

    // The route validates UUID format — non-UUID strings are rejected
    expect(mockGetCardById).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });
});
