import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db/cards.js', () => ({
  findByUrlHash: vi.fn(),
  findByTimeRange: vi.fn(),
}));

vi.mock('../../utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { isDuplicate } from '../deduplicator.js';
import { findByUrlHash, findByTimeRange } from '../../db/cards.js';

const mockFindByUrlHash = vi.mocked(findByUrlHash);
const mockFindByTimeRange = vi.mocked(findByTimeRange);

describe('isDuplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when URL hash matches', async () => {
    mockFindByUrlHash.mockResolvedValueOnce({ id: 'card-1' } as any);

    const result = await isDuplicate('https://example.com/article', 'Some Title', new Date());
    expect(result).toBe(true);
    expect(mockFindByUrlHash).toHaveBeenCalledTimes(1);
    // Should not even check time range when URL hash matches
    expect(mockFindByTimeRange).not.toHaveBeenCalled();
  });

  it('returns false when no hash match and no similar titles', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockResolvedValueOnce([
      { headline: 'Completely different headline', published_at: '2024-01-15T10:00:00Z' },
    ]);

    const result = await isDuplicate(
      'https://example.com/new-article',
      'Ethereum Staking Updates',
      new Date('2024-01-15T12:00:00Z')
    );
    expect(result).toBe(false);
  });

  it('returns true when fuzzy title match found within 6h window', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockResolvedValueOnce([
      { headline: 'Ethereum Staking Update', published_at: '2024-01-15T10:00:00Z' },
    ]);

    // Very similar title (one extra 's')
    const result = await isDuplicate(
      'https://other.com/article',
      'Ethereum Staking Updates',
      new Date('2024-01-15T12:00:00Z')
    );
    expect(result).toBe(true);
  });

  it('returns false when similar title outside 6h window (findByTimeRange returns empty)', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockResolvedValueOnce([]);

    const result = await isDuplicate(
      'https://example.com/article',
      'Some Title',
      new Date('2024-01-15T12:00:00Z')
    );
    expect(result).toBe(false);
  });

  it('returns false when title is empty (skips fuzzy check)', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);

    const result = await isDuplicate(
      'https://example.com/article',
      '',
      new Date('2024-01-15T12:00:00Z')
    );
    expect(result).toBe(false);
    // Should not call findByTimeRange when title is empty
    expect(mockFindByTimeRange).not.toHaveBeenCalled();
  });

  it('findByTimeRange called with correct 6h window', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockResolvedValueOnce([]);

    const publishedAt = new Date('2024-01-15T12:00:00Z');
    const sixHoursBefore = new Date('2024-01-15T06:00:00Z');

    await isDuplicate('https://example.com/article', 'Some Title', publishedAt);

    expect(mockFindByTimeRange).toHaveBeenCalledWith(sixHoursBefore, publishedAt);
  });

  it('handles empty recentCards array', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockResolvedValueOnce([]);

    const result = await isDuplicate(
      'https://example.com/article',
      'Some Title',
      new Date('2024-01-15T12:00:00Z')
    );
    expect(result).toBe(false);
  });

  it('hash is computed from the canonical URL', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockResolvedValueOnce([]);

    await isDuplicate('https://example.com/article', 'Title', new Date());

    // hashUrl uses SHA-256 of the URL
    const { createHash } = await import('node:crypto');
    const expectedHash = createHash('sha256').update('https://example.com/article').digest('hex');
    expect(mockFindByUrlHash).toHaveBeenCalledWith(expectedHash);
  });

  it('computes hash for empty URL string and still performs hash check', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockResolvedValueOnce([]);

    const result = await isDuplicate('', 'Some Title', new Date('2024-01-15T12:00:00Z'));
    expect(result).toBe(false);

    // hashUrl('') should still produce a valid hash and be passed to findByUrlHash
    const { createHash } = await import('node:crypto');
    const expectedHash = createHash('sha256').update('').digest('hex');
    expect(mockFindByUrlHash).toHaveBeenCalledWith(expectedHash);
  });

  it('propagates error when findByUrlHash throws', async () => {
    mockFindByUrlHash.mockRejectedValueOnce(new Error('DB connection failed'));

    await expect(
      isDuplicate('https://example.com/article', 'Title', new Date())
    ).rejects.toThrow('DB connection failed');
  });

  it('propagates error when findByTimeRange throws', async () => {
    mockFindByUrlHash.mockResolvedValueOnce(null);
    mockFindByTimeRange.mockRejectedValueOnce(new Error('Query timeout'));

    await expect(
      isDuplicate('https://example.com/article', 'Some Title', new Date('2024-01-15T12:00:00Z'))
    ).rejects.toThrow('Query timeout');
  });
});
