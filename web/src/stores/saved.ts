'use client';

import { create } from 'zustand';
import type { Card } from '@ethpulse/shared';

interface SavedState {
  savedIds: Set<string>;
  savedCards: Card[];
  initialized: boolean;
  init: () => Promise<void>;
  toggleSave: (cardId: string) => Promise<boolean>;
  isSaved: (cardId: string) => boolean;
  reset: () => void;
}

export const useSaved = create<SavedState>((set, get) => ({
  savedIds: new Set(),
  savedCards: [],
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    try {
      const res = await fetch('/api/saved');
      if (!res.ok) {
        // Not signed in or error — just mark initialized with empty
        set({ initialized: true });
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
      set({ initialized: true });
    }
  },

  toggleSave: async (cardId: string) => {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId }),
    });

    if (!res.ok) return false;

    const { saved } = await res.json();

    if (saved) {
      set(state => ({
        savedIds: new Set([...state.savedIds, cardId]),
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
