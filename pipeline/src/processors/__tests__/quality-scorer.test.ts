import { describe, it, expect } from 'vitest';
import { scoreQuality, shouldAutoSuppress } from '../quality-scorer.js';

describe('scoreQuality', () => {
  it('returns 1.0 for tier-1 source with full content signals', () => {
    const score = scoreQuality({
      sourceId: 'ethresear.ch',
      headline: 'A substantial headline here',
      summary: 'A summary that is definitely longer than forty characters in total.',
      author: 'vitalik',
      engagement: { likes: 10, replies: 5, views: 100 },
    });
    // 1.0 * 0.4 + (0.35 + 0.40 + 0.15 + 0.10) * 0.6 = 0.4 + 0.6 = 1.0
    expect(score).toBeCloseTo(1.0, 5);
  });

  it('returns 0.8 for unknown source with full content signals', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: 'A substantial headline here',
      summary: 'A summary that is definitely longer than forty characters in total.',
      author: 'someone',
      engagement: { likes: 1 },
    });
    // 0.5 * 0.4 + 1.0 * 0.6 = 0.2 + 0.6 = 0.8
    expect(score).toBeCloseTo(0.8, 5);
  });

  it('returns 0.2 for unknown source with no content signals', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: '',
      author: null,
      engagement: null,
    });
    // 0.5 * 0.4 + 0.0 * 0.6 = 0.2
    expect(score).toBeCloseTo(0.2, 5);
  });

  it('adds 0.35 to content signals for headline > 10 chars', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: 'Long headline text',
      summary: '',
      author: null,
      engagement: null,
    });
    // 0.5 * 0.4 + 0.35 * 0.6 = 0.2 + 0.21 = 0.41
    expect(score).toBeCloseTo(0.41, 5);
  });

  it('adds 0.15 to content signals for headline 1-10 chars', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: 'Short',
      summary: '',
      author: null,
      engagement: null,
    });
    // 0.5 * 0.4 + 0.15 * 0.6 = 0.2 + 0.09 = 0.29
    expect(score).toBeCloseTo(0.29, 5);
  });

  it('adds 0 to content signals for empty headline', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: '',
      author: null,
      engagement: null,
    });
    // 0.5 * 0.4 + 0.0 * 0.6 = 0.2
    expect(score).toBeCloseTo(0.2, 5);
  });

  it('adds 0.40 to content signals for summary > 40 chars', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: 'This is a long summary that exceeds forty characters easily.',
      author: null,
      engagement: null,
    });
    // 0.5 * 0.4 + 0.40 * 0.6 = 0.2 + 0.24 = 0.44
    expect(score).toBeCloseTo(0.44, 5);
  });

  it('adds 0.15 to content signals for summary 1-40 chars', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: 'Short summary',
      author: null,
      engagement: null,
    });
    // 0.5 * 0.4 + 0.15 * 0.6 = 0.2 + 0.09 = 0.29
    expect(score).toBeCloseTo(0.29, 5);
  });

  it('adds 0.15 to content signals when author is present', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: '',
      author: 'vitalik',
      engagement: null,
    });
    // 0.5 * 0.4 + 0.15 * 0.6 = 0.2 + 0.09 = 0.29
    expect(score).toBeCloseTo(0.29, 5);
  });

  it('adds 0.10 to content signals when engagement has likes', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: '',
      author: null,
      engagement: { likes: 5 },
    });
    // 0.5 * 0.4 + 0.10 * 0.6 = 0.2 + 0.06 = 0.26
    expect(score).toBeCloseTo(0.26, 5);
  });

  it('adds 0 for null engagement', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: '',
      author: null,
      engagement: null,
    });
    // 0.5 * 0.4 + 0.0 * 0.6 = 0.2
    expect(score).toBeCloseTo(0.2, 5);
  });

  it('adds 0 for engagement with all zeros', () => {
    const score = scoreQuality({
      sourceId: 'unknown-source.com',
      headline: '',
      summary: '',
      author: null,
      engagement: { likes: 0, replies: 0, views: 0 },
    });
    // 0.5 * 0.4 + 0.0 * 0.6 = 0.2
    expect(score).toBeCloseTo(0.2, 5);
  });
});

describe('shouldAutoSuppress', () => {
  it('returns true for score below 0.25', () => {
    expect(shouldAutoSuppress(0.24)).toBe(true);
  });

  it('returns false for score equal to 0.25', () => {
    expect(shouldAutoSuppress(0.25)).toBe(false);
  });

  it('returns false for score above 0.25', () => {
    expect(shouldAutoSuppress(0.5)).toBe(false);
  });
});
