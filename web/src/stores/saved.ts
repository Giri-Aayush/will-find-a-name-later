'use client';

import { create } from 'zustand';
import type { Card } from '@hexcast/shared';

interface SavedState {
  savedIds: Set<string>;
  savedCards: Card[];
  initialized: boolean;
  init: () => Promise<void>;
  toggleSave: (cardId: string, card?: Card) => Promise<boolean>;
  isSaved: (cardId: string) => boolean;
  reset: () => void;
}

let initPromise: Promise<void> | null = null;

export const useSaved = create<SavedState>((set, get) => ({
  savedIds: new Set(),
  savedCards: [],
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    // Deduplicate concurrent init calls into a single fetch
    if (!initPromise) {
      initPromise = (async () => {
        try {
          const res = await fetch('/api/saved');
          if (!res.ok) {
            // Don't set initialized — allow retry on next navigation
            return;
          }
          const { saved } = await res.json();
          const cards = (saved ?? []).map((s: { cards: Card }) => s.cards).filter(Boolean);
          set({
            savedCards: cards,
            savedIds: new Set(cards.map((c: Card) => c.id)),
            initialized: true,
          });
        } catch {
          // Don't set initialized — allow retry on next navigation
        } finally {
          initPromise = null;
        }
      })();
    }
    return initPromise;
  },

  toggleSave: async (cardId: string, card?: Card) => {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId }),
    });

    if (!res.ok) throw new Error('Failed to save');

    const { saved } = await res.json();

    if (saved) {
      set(state => ({
        savedIds: new Set([...state.savedIds, cardId]),
        savedCards: card && !state.savedCards.some(c => c.id === cardId)
          ? [card, ...state.savedCards]
          : state.savedCards,
      }));
    } else {
      set(state => ({
        savedIds: new Set([...state.savedIds].filter(id => id !== cardId)),
        savedCards: state.savedCards.filter(c => c.id !== cardId),
      }));
    }

    return saved;
  },

  isSaved: (cardId) => get().savedIds.has(cardId),

  reset: () => set({ savedIds: new Set(), savedCards: [], initialized: false }),
}));
