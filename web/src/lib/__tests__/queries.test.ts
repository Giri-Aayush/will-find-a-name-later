import { describe, it, expect, vi } from 'vitest';
import type { Card } from '@hexcast/shared';

vi.mock('@/lib/supabase', () => ({
  supabase: {},
}));

import { interleaveBySource } from '../queries';

function makeCard(category: string, id?: string): Card {
  return {
    id: id ?? crypto.randomUUID(),
    source_id: 'test',
    canonical_url: 'https://example.com',
    url_hash: 'abc',
    headline: 'Test',
    summary: 'Test summary',
    category,
    quality_score: 0.8,
    author: null,
    engagement: null,
    published_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    is_suspended: false,
    flag_count: 0,
    reaction_up_count: 0,
    reaction_down_count: 0,
    pipeline_version: '1.0.0',
  } as Card;
}

describe('interleaveBySource', () => {
  it('returns an empty array for empty input', () => {
    expect(interleaveBySource([])).toEqual([]);
  });

  it('returns the same card for a single-element array', () => {
    const card = makeCard('RESEARCH', 'single');
    const result = interleaveBySource([card]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('single');
  });

  it('interleaves cards from 2 categories in round-robin', () => {
    const cards = [
      makeCard('GOVERNANCE', 'g1'),
      makeCard('GOVERNANCE', 'g2'),
      makeCard('RESEARCH', 'r1'),
      makeCard('RESEARCH', 'r2'),
    ];
    const result = interleaveBySource(cards);
    expect(result).toHaveLength(4);
    // Round-robin: no two consecutive cards should share a category
    for (let i = 1; i < result.length; i++) {
      expect(result[i].category).not.toBe(result[i - 1].category);
    }
  });

  it('handles imbalanced categories by spreading the largest category', () => {
    const cards = [
      makeCard('GOVERNANCE', 'g1'),
      makeCard('GOVERNANCE', 'g2'),
      makeCard('GOVERNANCE', 'g3'),
      makeCard('RESEARCH', 'r1'),
      makeCard('SECURITY', 's1'),
    ];
    const result = interleaveBySource(cards);
    expect(result).toHaveLength(5);
    // Round-robin distributes GOV across rounds: GOV, RESEARCH, SECURITY, GOV, GOV
    // The first card from each round should alternate categories
    expect(result[0].category).toBe('GOVERNANCE');
    expect(result[1].category).not.toBe('GOVERNANCE');
    expect(result[2].category).not.toBe('GOVERNANCE');
    // All original cards are present
    const categories = result.map((c) => c.category);
    expect(categories.filter((c) => c === 'GOVERNANCE')).toHaveLength(3);
    expect(categories.filter((c) => c === 'RESEARCH')).toHaveLength(1);
    expect(categories.filter((c) => c === 'SECURITY')).toHaveLength(1);
  });

  it('preserves total card count', () => {
    const cards = [
      makeCard('GOVERNANCE', 'g1'),
      makeCard('GOVERNANCE', 'g2'),
      makeCard('RESEARCH', 'r1'),
      makeCard('SECURITY', 's1'),
      makeCard('SECURITY', 's2'),
      makeCard('UPGRADE', 'u1'),
    ];
    const result = interleaveBySource(cards);
    expect(result).toHaveLength(cards.length);
  });

  it('works with a single category (all returned in same order)', () => {
    const cards = [
      makeCard('RESEARCH', 'r1'),
      makeCard('RESEARCH', 'r2'),
      makeCard('RESEARCH', 'r3'),
    ];
    const result = interleaveBySource(cards);
    expect(result).toHaveLength(3);
    expect(result.map((c) => c.id)).toEqual(['r1', 'r2', 'r3']);
  });

  it('handles 4+ categories', () => {
    const cards = [
      makeCard('GOVERNANCE', 'g1'),
      makeCard('GOVERNANCE', 'g2'),
      makeCard('RESEARCH', 'r1'),
      makeCard('RESEARCH', 'r2'),
      makeCard('SECURITY', 's1'),
      makeCard('SECURITY', 's2'),
      makeCard('UPGRADE', 'u1'),
      makeCard('UPGRADE', 'u2'),
    ];
    const result = interleaveBySource(cards);
    expect(result).toHaveLength(8);
    // With 4 equal categories, no two consecutive should share a category
    for (let i = 1; i < result.length; i++) {
      expect(result[i].category).not.toBe(result[i - 1].category);
    }
  });
});
