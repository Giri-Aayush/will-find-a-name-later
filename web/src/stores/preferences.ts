'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  hiddenSources: string[];
  filterSource: string | null;
  toggleHideSource: (sourceId: string) => void;
  setFilterSource: (sourceId: string | null) => void;
  isSourceHidden: (sourceId: string) => boolean;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      hiddenSources: [],
      filterSource: null,
      toggleHideSource: (sourceId) => {
        const current = get().hiddenSources;
        set({
          hiddenSources: current.includes(sourceId)
            ? current.filter(s => s !== sourceId)
            : [...current, sourceId],
        });
      },
      setFilterSource: (sourceId) => set({ filterSource: sourceId }),
      isSourceHidden: (sourceId) => get().hiddenSources.includes(sourceId),
    }),
    { name: 'hexcast-preferences' }
  )
);
