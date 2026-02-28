import { describe, it, expect } from 'vitest';
import { hashUrl } from '../hash.js';

describe('hashUrl', () => {
  it('returns a 64-character hex string', () => {
    const result = hashUrl('https://example.com');
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns the same hash for the same URL', () => {
    const url = 'https://ethresear.ch/t/some-post/12345';
    expect(hashUrl(url)).toBe(hashUrl(url));
  });

  it('returns different hashes for different URLs', () => {
    const hash1 = hashUrl('https://example.com/a');
    const hash2 = hashUrl('https://example.com/b');
    expect(hash1).not.toBe(hash2);
  });

  it('handles URLs with query params and fragments', () => {
    const url = 'https://example.com/page?foo=bar&baz=qux#section-3';
    const result = hashUrl(url);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
    // Different query params produce different hashes
    const url2 = 'https://example.com/page?foo=bar&baz=other#section-3';
    expect(hashUrl(url)).not.toBe(hashUrl(url2));
  });

  it('handles empty string', () => {
    const result = hashUrl('');
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('handles Unicode URL and returns valid 64-char hex', () => {
    const result = hashUrl('https://例え.jp/ページ');
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('handles very long URL (10,000 chars) and returns valid 64-char hex', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(10000);
    const result = hashUrl(longUrl);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for URLs with special characters', () => {
    const url = 'https://example.com/path?a=1&b=2#section';
    const hash1 = hashUrl(url);
    const hash2 = hashUrl(url);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });
});
