import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { relativeTime, extractDomain } from '../utils';

describe('relativeTime', () => {
  const NOW = new Date('2025-01-15T12:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than 1 minute ago', () => {
    const iso = new Date(NOW - 30_000).toISOString(); // 30 seconds ago
    expect(relativeTime(iso)).toBe('just now');
  });

  it('returns "5m ago" for 5 minutes ago', () => {
    const iso = new Date(NOW - 5 * 60_000).toISOString();
    expect(relativeTime(iso)).toBe('5m ago');
  });

  it('returns "3h ago" for 3 hours ago', () => {
    const iso = new Date(NOW - 3 * 60 * 60_000).toISOString();
    expect(relativeTime(iso)).toBe('3h ago');
  });

  it('returns "2d ago" for 2 days ago', () => {
    const iso = new Date(NOW - 2 * 24 * 60 * 60_000).toISOString();
    expect(relativeTime(iso)).toBe('2d ago');
  });

  it('returns a formatted date for 10 days ago', () => {
    const iso = new Date(NOW - 10 * 24 * 60 * 60_000).toISOString();
    const result = relativeTime(iso);
    // Jan 5 (10 days before Jan 15)
    expect(result).toBe('Jan 5');
  });
});

describe('extractDomain', () => {
  it('extracts hostname from a full URL', () => {
    expect(extractDomain('https://blog.ethereum.org/post')).toBe('blog.ethereum.org');
  });

  it('strips www prefix', () => {
    expect(extractDomain('https://www.example.com')).toBe('example.com');
  });

  it('returns original string for invalid URL', () => {
    expect(extractDomain('not-a-url')).toBe('not-a-url');
  });

  it('extracts hostname from URL with port', () => {
    expect(extractDomain('https://localhost:3000/path')).toBe('localhost');
  });

  it('extracts hostname from URL with query string', () => {
    expect(extractDomain('https://example.com/page?foo=bar&baz=1')).toBe('example.com');
  });
});
