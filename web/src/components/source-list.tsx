'use client';

import type { SourceRegistry } from '@ethpulse/shared';
import { usePreferences } from '@/stores/preferences';
import { CATEGORY_LABELS, CATEGORY_BADGE_CLASS } from '@/lib/utils';

export function SourceList({ sources }: { sources: SourceRegistry[] }) {
  const { hiddenSources, toggleHideSource } = usePreferences();

  return (
    <div className="space-y-2">
      {sources.map(source => {
        const hidden = hiddenSources.includes(source.id);
        const badgeClass = CATEGORY_BADGE_CLASS[source.default_category] ?? 'badge-research';

        return (
          <div
            key={source.id}
            className="flex items-center justify-between p-3 transition-all duration-150"
            style={{
              background: hidden ? 'transparent' : 'var(--bg-card)',
              border: hidden
                ? '1px dashed var(--border-subtle)'
                : '1px solid var(--border-medium)',
              opacity: hidden ? 0.5 : 1,
            }}
          >
            <div className="min-w-0 flex-1">
              <div
                className="text-[12px] font-medium truncate"
                style={{ color: hidden ? 'var(--text-muted)' : 'var(--text-primary)' }}
              >
                {source.display_name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-block px-1.5 py-0.5 text-[9px] font-medium tracking-widest uppercase ${badgeClass}`}
                >
                  {CATEGORY_LABELS[source.default_category] ?? source.default_category}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleHideSource(source.id)}
              className="ml-3 shrink-0 px-3 py-1 text-[10px] font-medium tracking-widest uppercase transition-colors duration-150"
              style={{
                color: hidden ? 'var(--text-muted)' : 'var(--accent)',
                border: hidden
                  ? '1px solid var(--border-subtle)'
                  : '1px solid var(--accent)',
              }}
            >
              [{hidden ? 'off' : 'on'}]
            </button>
          </div>
        );
      })}
    </div>
  );
}
