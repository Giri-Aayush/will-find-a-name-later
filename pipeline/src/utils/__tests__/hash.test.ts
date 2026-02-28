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
});
