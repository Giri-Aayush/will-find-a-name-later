import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseFetcher } from '../base.js';
import type { FetchResult } from '@hexcast/shared';

class TestFetcher extends BaseFetcher {
  async fetch(): Promise<FetchResult[]> {
    return [];
  }

  public testIsAfterLastPoll(date: Date | null): boolean {
    return this.isAfterLastPoll(date);
  }

  public testBuildUrl(path: string): string {
    return this.buildUrl(path);
  }
}

describe('BaseFetcher', () => {
  describe('isAfterLastPoll', () => {
    it('returns true when date is null (no date = always include)', () => {
      const fetcher = new TestFetcher({
        sourceId: 'test',
        baseUrl: 'https://example.com',
        apiType: 'rss',
        lastPolledAt: new Date('2024-01-15T10:00:00Z'),
      });

      expect(fetcher.testIsAfterLastPoll(null)).toBe(true);
    });

    it('returns true when lastPolledAt is null (never polled = include all)', () => {
      const fetcher = new TestFetcher({
        sourceId: 'test',
        baseUrl: 'https://example.com',
        apiType: 'rss',
        lastPolledAt: null,
      });

      expect(fetcher.testIsAfterLastPoll(new Date('2024-01-15T10:00:00Z'))).toBe(true);
    });

    it('returns true when date is after lastPolledAt', () => {
      const fetcher = new TestFetcher({
        sourceId: 'test',
        baseUrl: 'https://example.com',
        apiType: 'rss',
        lastPolledAt: new Date('2024-01-15T10:00:00Z'),
      });

      expect(fetcher.testIsAfterLastPoll(new Date('2024-01-15T12:00:00Z'))).toBe(true);
    });

    it('returns false when date is before lastPolledAt', () => {
      const fetcher = new TestFetcher({
        sourceId: 'test',
        baseUrl: 'https://example.com',
        apiType: 'rss',
        lastPolledAt: new Date('2024-01-15T10:00:00Z'),
      });

      expect(fetcher.testIsAfterLastPoll(new Date('2024-01-15T08:00:00Z'))).toBe(false);
    });

    it('returns false when date equals lastPolledAt', () => {
      const fetcher = new TestFetcher({
        sourceId: 'test',
        baseUrl: 'https://example.com',
        apiType: 'rss',
        lastPolledAt: new Date('2024-01-15T10:00:00Z'),
      });

      expect(fetcher.testIsAfterLastPoll(new Date('2024-01-15T10:00:00Z'))).toBe(false);
    });
  });
});
