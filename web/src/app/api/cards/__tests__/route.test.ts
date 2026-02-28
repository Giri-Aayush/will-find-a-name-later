import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks (before route import) ---

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/queries', () => ({
  getCards: vi.fn(),
  getPersonalizedCards: vi.fn(),
}));

import { GET } from '../route';
import { auth } from '@clerk/nextjs/server';
import { getCards, getPersonalizedCards } from '@/lib/queries';

const mockAuth = vi.mocked(auth);
const mockGetCards = vi.mocked(getCards);
const mockGetPersonalizedCards = vi.mocked(getPersonalizedCards);

// --- Helpers ---

function req(url: string, opts?: { method?: string; body?: unknown }) {
  const { method = 'GET', body } = opts ?? {};
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'content-type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ userId: null } as any);
  mockGetCards.mockResolvedValue([]);
  mockGetPersonalizedCards.mockResolvedValue({ cards: [], unseenCount: 0 } as any);
});

describe('GET /api/cards', () => {
  it('returns anonymous feed when not authenticated', async () => {
    const cards = [{ id: '1', headline: 'test' }];
    mockGetCards.mockResolvedValue(cards as any);

    const res = await GET(req('http://localhost:3000/api/cards'));
    const json = await res.json();

    expect(mockGetCards).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
      category: undefined,
      source: undefined,
    });
    expect(json.cards).toEqual(cards);
    expect(json.hasMore).toBe(false);
  });

  it('returns personalized feed when authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' } as any);
    const cards = [{ id: '1', headline: 'test' }];
    mockGetPersonalizedCards.mockResolvedValue({ cards, unseenCount: 5 } as any);

    const res = await GET(req('http://localhost:3000/api/cards'));
    const json = await res.json();

    expect(mockGetPersonalizedCards).toHaveBeenCalledWith({
      userId: 'user_123',
      limit: 20,
      category: undefined,
      cursorSeen: undefined,
      cursorPublished: undefined,
    });
    expect(json.cards).toEqual(cards);
    expect(json.unseenCount).toBe(5);
  });

  it('clamps limit to max 50', async () => {
    const res = await GET(req('http://localhost:3000/api/cards?limit=100'));
    await res.json();

    expect(mockGetCards).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50 }),
    );
  });

  it('passes category filter', async () => {
    const res = await GET(req('http://localhost:3000/api/cards?category=defi'));
    await res.json();

    expect(mockGetCards).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'defi' }),
    );
  });

  it('passes source filter', async () => {
    const res = await GET(req('http://localhost:3000/api/cards?source=coindesk'));
    await res.json();

    expect(mockGetCards).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'coindesk' }),
    );
  });

  it('passes cursor for anonymous feed', async () => {
    const res = await GET(
      req('http://localhost:3000/api/cards?cursor=2024-01-01T00:00:00Z'),
    );
    await res.json();

    expect(mockGetCards).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: '2024-01-01T00:00:00Z' }),
    );
  });

  it('returns 500 on query error', async () => {
    mockGetCards.mockRejectedValue(new Error('DB failure'));

    const res = await GET(req('http://localhost:3000/api/cards'));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe('Failed to fetch cards');
  });
});
