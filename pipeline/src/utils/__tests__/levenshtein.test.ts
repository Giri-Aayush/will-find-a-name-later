import { describe, it, expect } from 'vitest';
import { levenshteinDistance, isSimilar } from '../levenshtein.js';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });

  it('returns b.length when a is empty', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
  });

  it('returns a.length when b is empty', () => {
    expect(levenshteinDistance('hello', '')).toBe(5);
  });

  it('returns 1 for "kitten" → "sitten"', () => {
    expect(levenshteinDistance('kitten', 'sitten')).toBe(1);
  });

  it('returns 1 for "abc" → "abcd" (insertion)', () => {
    expect(levenshteinDistance('abc', 'abcd')).toBe(1);
  });

  it('returns 1 for "abcd" → "abc" (deletion)', () => {
    expect(levenshteinDistance('abcd', 'abc')).toBe(1);
  });

  it('returns 3 for "kitten" → "sitting"', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });

  it('returns 0 for both empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0);
  });
});

describe('isSimilar', () => {
  it('returns true for identical strings', () => {
    expect(isSimilar('ethereum', 'ethereum')).toBe(true);
  });

  it('returns true for very similar strings (< 20% edit distance)', () => {
    // "ethereum" (8 chars) vs "ethereun" (8 chars) → distance 1, ratio 1/8 = 0.125 < 0.2
    expect(isSimilar('ethereum', 'ethereun')).toBe(true);
  });

  it('returns false for very different strings', () => {
    expect(isSimilar('abc', 'xyz')).toBe(false);
  });

  it('is case insensitive ("Hello" vs "hello")', () => {
    expect(isSimilar('Hello', 'hello')).toBe(true);
  });

  it('returns true for both empty strings', () => {
    expect(isSimilar('', '')).toBe(true);
  });

  it('returns true with custom threshold 0.5 for "abc" vs "axc"', () => {
    // distance = 1, maxLen = 3, ratio = 1/3 ≈ 0.33 < 0.5 → true
    expect(isSimilar('abc', 'axc', 0.5)).toBe(true);
  });
});
