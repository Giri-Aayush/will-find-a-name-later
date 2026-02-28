import { describe, it, expect } from 'vitest';
import { normalize } from '../normalizer.js';
import type { RawItem } from '@hexcast/shared';

function makeRawItem(overrides: Partial<RawItem> = {}): RawItem {
  return {
    id: 'test-id',
    source_id: 'ethresear.ch',
    canonical_url: 'https://example.com/post',
    raw_title: 'Test Title',
    raw_text: 'Test full text content',
    raw_metadata: {},
    published_at: '2024-01-15T10:00:00Z',
    fetched_at: '2024-01-15T12:00:00Z',
    processed: false,
    ...overrides,
  };
}

describe('normalize', () => {
  it('returns null for empty title AND empty text', () => {
    const item = makeRawItem({ raw_title: '', raw_text: '' });
    expect(normalize(item)).toBeNull();
  });

  it('returns null for null title AND null text', () => {
    const item = makeRawItem({ raw_title: null, raw_text: null });
    expect(normalize(item)).toBeNull();
  });

  it('returns a NormalizedItem with all fields', () => {
    const item = makeRawItem();
    const result = normalize(item);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      sourceId: 'ethresear.ch',
      canonicalUrl: 'https://example.com/post',
      title: 'Test Title',
      author: null,
      publishedAt: new Date('2024-01-15T10:00:00Z'),
      fullText: 'Test full text content',
      engagement: null,
      rawMetadata: {},
    });
  });

  it('uses raw_title as title', () => {
    const item = makeRawItem({ raw_title: 'My Custom Title' });
    const result = normalize(item)!;
    expect(result.title).toBe('My Custom Title');
  });

  it('uses raw_text as fullText', () => {
    const item = makeRawItem({ raw_text: 'Full body text here' });
    const result = normalize(item)!;
    expect(result.fullText).toBe('Full body text here');
  });

  it('falls back to title when raw_text is empty', () => {
    const item = makeRawItem({ raw_title: 'Fallback Title', raw_text: '' });
    const result = normalize(item)!;
    expect(result.fullText).toBe('Fallback Title');
  });

  it('falls back to title when raw_text is null', () => {
    const item = makeRawItem({ raw_title: 'Fallback Title', raw_text: null });
    const result = normalize(item)!;
    expect(result.fullText).toBe('Fallback Title');
  });

  it('uses published_at when available', () => {
    const item = makeRawItem({ published_at: '2024-06-01T08:00:00Z' });
    const result = normalize(item)!;
    expect(result.publishedAt).toEqual(new Date('2024-06-01T08:00:00Z'));
  });

  it('falls back to fetched_at when published_at is null', () => {
    const item = makeRawItem({ published_at: null, fetched_at: '2024-01-15T12:00:00Z' });
    const result = normalize(item)!;
    expect(result.publishedAt).toEqual(new Date('2024-01-15T12:00:00Z'));
  });

  it('produces Invalid Date when published_at is an invalid date string (does not fall back)', () => {
    // 'not-a-date' is truthy, so the ternary uses new Date('not-a-date') which is Invalid Date
    const item = makeRawItem({ published_at: 'not-a-date', fetched_at: '2024-01-15T12:00:00Z' });
    const result = normalize(item)!;
    expect(result.publishedAt.getTime()).toBeNaN();
  });

  it('treats null raw_metadata as empty object', () => {
    const item = makeRawItem({ raw_metadata: null as any });
    const result = normalize(item)!;
    expect(result.rawMetadata).toEqual({});
    expect(result.author).toBeNull();
    expect(result.engagement).toBeNull();
  });

  describe('author extraction', () => {
    it('extracts Discourse author with name and username', () => {
      const item = makeRawItem({
        raw_metadata: { author_name: 'Vitalik Buterin', author_username: 'vitalik' },
      });
      const result = normalize(item)!;
      expect(result.author).toBe('Vitalik Buterin (@vitalik)');
    });

    it('extracts Discourse author with username only', () => {
      const item = makeRawItem({
        raw_metadata: { author_username: 'dankrad' },
      });
      const result = normalize(item)!;
      expect(result.author).toBe('@dankrad');
    });

    it('extracts GitHub author', () => {
      const item = makeRawItem({
        raw_metadata: { author: 'timbeiko' },
      });
      const result = normalize(item)!;
      expect(result.author).toBe('@timbeiko');
    });

    it('extracts CryptoPanic source_name as author', () => {
      const item = makeRawItem({
        raw_metadata: { source_name: 'CoinDesk' },
      });
      const result = normalize(item)!;
      expect(result.author).toBe('CoinDesk');
    });

    it('returns null when no author metadata present', () => {
      const item = makeRawItem({ raw_metadata: {} });
      const result = normalize(item)!;
      expect(result.author).toBeNull();
    });

    it('gives author priority over source_name when both are present (GitHub pattern)', () => {
      const item = makeRawItem({
        raw_metadata: { author: 'timbeiko', source_name: 'CoinDesk' },
      });
      const result = normalize(item)!;
      // extractAuthor checks metadata.author before metadata.source_name
      expect(result.author).toBe('@timbeiko');
    });
  });

  describe('engagement extraction', () => {
    it('extracts Discourse engagement metrics', () => {
      const item = makeRawItem({
        raw_metadata: { like_count: 42, reply_count: 7, views: 1500 },
      });
      const result = normalize(item)!;
      expect(result.engagement).toEqual({
        likes: 42,
        replies: 7,
        views: 1500,
      });
    });

    it('extracts CryptoPanic engagement metrics', () => {
      const item = makeRawItem({
        raw_metadata: { votes_positive: 15, votes_comments: 3 },
      });
      const result = normalize(item)!;
      expect(result.engagement).toEqual({
        likes: 15,
        replies: 3,
      });
    });

    it('returns null engagement when no engagement metadata present', () => {
      const item = makeRawItem({ raw_metadata: {} });
      const result = normalize(item)!;
      expect(result.engagement).toBeNull();
    });
  });
});
