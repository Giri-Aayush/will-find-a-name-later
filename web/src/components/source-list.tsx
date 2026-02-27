'use client';

import type { SourceRegistry } from '@ethpulse/shared';
import { usePreferences } from '@/stores/preferences';
import { CATEGORY_LABELS } from '@/lib/utils';

export function SourceList({ sources }: { sources: SourceRegistry[] }) {
  const { hiddenSources, toggleHideSource } = usePreferences();

  return (
    <div className="space-y-2">
      {sources.map(source => {
        const hidden = hiddenSources.includes(source.id);
        return (
          <div
            key={source.id}
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
              hidden
                ? 'border-gray-800/50 bg-gray-900/50 opacity-60'
                : 'border-gray-800 bg-gray-900'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{source.display_name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 truncate">{source.id}</span>
                <span className="text-xs text-gray-600">
                  {CATEGORY_LABELS[source.default_category] ?? source.default_category}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleHideSource(source.id)}
              className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                hidden
                  ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  : 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50'
              }`}
            >
              {hidden ? 'Hidden' : 'Visible'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
