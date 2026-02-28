'use client';

import { create } from 'zustand';

type Reaction = 'up' | 'down' | null;

interface ReactionCounts {
  up: number;
  down: number;
}

interface ReactionsState {
  /** Aggregate counts per card */
  counts: Record<string, ReactionCounts>;
  /** Current user's reaction per card */
  userReactions: Record<string, Reaction>;
  /** Card IDs we've already fetched */
  fetched: Set<string>;

  /** Fetch reactions + counts for a batch of card IDs */
  fetchForCards: (cardIds: string[]) => Promise<void>;

  /** Toggle a reaction (optimistic UI) */
  react: (cardId: string, reaction: 'up' | 'down') => Promise<void>;

  /** Get user's reaction for a card */
  getUserReaction: (cardId: string) => Reaction;

  /** Get counts for a card */
  getCounts: (cardId: string) => ReactionCounts;

  reset: () => void;
}

export const useReactions = create<ReactionsState>((set, get) => ({
  counts: {},
  userReactions: {},
  fetched: new Set(),

  fetchForCards: async (cardIds: string[]) => {
    // Only fetch IDs we haven't fetched yet
    const unfetched = cardIds.filter(id => !get().fetched.has(id));
    if (unfetched.length === 0) return;

    try {
      const res = await fetch(`/api/reactions?card_ids=${unfetched.join(',')}`);
      if (!res.ok) return;
      const { reactions, userReactions } = await res.json();

      set(state => ({
        counts: { ...state.counts, ...reactions },
        userReactions: { ...state.userReactions, ...userReactions },
        fetched: new Set([...state.fetched, ...unfetched]),
      }));
    } catch {
      // Silently fail
    }
  },

  react: async (cardId: string, reaction: 'up' | 'down') => {
    const prev = get().userReactions[cardId] ?? null;
    const prevCounts = get().counts[cardId] ?? { up: 0, down: 0 };

    // Optimistic update
    let newReaction: Reaction;
    const newCounts = { ...prevCounts };

    if (prev === reaction) {
      // Toggle off
      newReaction = null;
      newCounts[reaction] = Math.max(0, newCounts[reaction] - 1);
    } else {
      // Switch or new reaction
      newReaction = reaction;
      newCounts[reaction] = newCounts[reaction] + 1;
      if (prev) {
        newCounts[prev] = Math.max(0, newCounts[prev] - 1);
      }
    }

    set(state => ({
      userReactions: { ...state.userReactions, [cardId]: newReaction },
      counts: { ...state.counts, [cardId]: newCounts },
    }));

    // Sync to server
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, reaction }),
      });

      if (!res.ok) {
        // Revert on failure — read fresh state to avoid stale closure
        const freshPrev = get().userReactions[cardId];
        if (freshPrev === newReaction) {
          set(state => ({
            userReactions: { ...state.userReactions, [cardId]: prev },
            counts: { ...state.counts, [cardId]: prevCounts },
          }));
        }
      }
    } catch {
      // Revert on error — read fresh state to avoid stale closure
      const freshPrev = get().userReactions[cardId];
      if (freshPrev === newReaction) {
        set(state => ({
          userReactions: { ...state.userReactions, [cardId]: prev },
          counts: { ...state.counts, [cardId]: prevCounts },
        }));
      }
    }
  },

  getUserReaction: (cardId) => get().userReactions[cardId] ?? null,

  getCounts: (cardId) => get().counts[cardId] ?? { up: 0, down: 0 },

  reset: () => set({ counts: {}, userReactions: {}, fetched: new Set() }),
}));
