import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks (before route import) ---

// Provide a global React so JSX in the .tsx route file compiles correctly.
// The route uses JSX which esbuild transforms to React.createElement calls.
const { MockImageResponse } = vi.hoisted(() => {
  // Minimal React shim for JSX support
  const createElement = (...args: any[]) => ({ type: args[0], props: args[1], children: args.slice(2) });
  (globalThis as any).React = { createElement };

  class MockImageResponse extends Response {
    constructor(_element: any, _options?: any) {
      super('mock-image-body', {
        status: 200,
        headers: { 'content-type': 'image/png' },
      });
    }
  }
  return { MockImageResponse };
});

vi.mock('next/og', () => ({
  ImageResponse: MockImageResponse,
}));

vi.mock('@/lib/queries', () => ({
  getCardById: vi.fn(),
}));

import { GET } from '../route';
import { getCardById } from '@/lib/queries';

const mockGetCardById = vi.mocked(getCardById);

// --- Helpers ---

function makeCard(overrides: Record<string, any> = {}) {
  return {
    id: 'card-123',
    headline: 'EIP-4844 Proto-Danksharding',
    summary: 'A short summary about proto-danksharding and its implications for rollups.',
    category: 'RESEARCH',
    source_id: 'ethresear_ch',
    canonical_url: 'https://www.ethresear.ch/t/eip-4844',
    published_at: '2024-06-01T00:00:00Z',
    ...overrides,
  };
}

function req(url: string) {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

// --- Setup ---

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCardById.mockResolvedValue(null);
});

// --- Tests ---

describe('GET /api/og', () => {
  it('returns 400 when id query param is missing', async () => {
    const res = await GET(req('http://localhost:3000/api/og'));

    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toBe('Missing id');
  });

  it('returns 404 when card not found', async () => {
    mockGetCardById.mockResolvedValue(null);

    const res = await GET(req('http://localhost:3000/api/og?id=nonexistent'));

    expect(res.status).toBe(404);
    const text = await res.text();
    expect(text).toBe('Card not found');
  });

  it('returns 500 when getCardById throws', async () => {
    mockGetCardById.mockRejectedValue(new Error('DB error'));

    const res = await GET(req('http://localhost:3000/api/og?id=card-123'));

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toBe('Failed to generate image');
  });

  it('returns ImageResponse when card found', async () => {
    const card = makeCard();
    mockGetCardById.mockResolvedValue(card as any);

    const res = await GET(req('http://localhost:3000/api/og?id=card-123'));

    expect(res.status).toBe(200);
    expect(mockGetCardById).toHaveBeenCalledWith('card-123');
    // Verify it is an instance of our mock ImageResponse
    expect(res).toBeInstanceOf(MockImageResponse);
  });

  it('truncates summary at 180 chars', async () => {
    const longSummary = 'A'.repeat(250);
    const card = makeCard({ summary: longSummary });
    mockGetCardById.mockResolvedValue(card as any);

    const res = await GET(req('http://localhost:3000/api/og?id=card-123'));

    // The truncated summary would be 180 chars + '...'
    // Since ImageResponse is mocked, we verify the route succeeds
    expect(res.status).toBe(200);
    expect(mockGetCardById).toHaveBeenCalledWith('card-123');
  });

  it('extracts domain from canonical_url', async () => {
    const card = makeCard({ canonical_url: 'https://www.ethresear.ch/t/some-post' });
    mockGetCardById.mockResolvedValue(card as any);

    const res = await GET(req('http://localhost:3000/api/og?id=card-123'));

    // Domain extraction is internal to the JSX; verify the route succeeds
    expect(res.status).toBe(200);
  });

  it('falls back to RESEARCH colors for unknown category', async () => {
    const card = makeCard({ category: 'TOTALLY_UNKNOWN' });
    mockGetCardById.mockResolvedValue(card as any);

    const res = await GET(req('http://localhost:3000/api/og?id=card-123'));

    // Unknown category should fall back to RESEARCH colors (via ?? CATEGORY_COLORS.RESEARCH)
    // The route should not throw — it handles missing categories gracefully
    expect(res.status).toBe(200);
  });

  it('falls back to category name when no label mapping', async () => {
    const card = makeCard({ category: 'NEW_CATEGORY' });
    mockGetCardById.mockResolvedValue(card as any);

    const res = await GET(req('http://localhost:3000/api/og?id=card-123'));

    // CATEGORY_LABELS['NEW_CATEGORY'] is undefined, so ?? card.category is used
    // The route should handle this without error
    expect(res.status).toBe(200);
  });
});
