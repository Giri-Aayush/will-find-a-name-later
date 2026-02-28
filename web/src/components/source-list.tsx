'use client';

import { useMemo, useState } from 'react';
import type { SourceRegistry, QualityGrade } from '@hexcast/shared';
import { SOURCE_QUALITY, GRADE_SORT_ORDER } from '@hexcast/shared';
import { usePreferences } from '@/stores/preferences';
import { CATEGORY_LABELS, CATEGORY_BADGE_CLASS } from '@/lib/utils';

const GRADE_STYLE: Record<QualityGrade, { color: string; glow: string }> = {
  S: { color: '#f59e0b', glow: '0 0 8px rgba(245, 158, 11, 0.4)' },
  A: { color: '#3b82f6', glow: '0 0 8px rgba(59, 130, 246, 0.3)' },
  B: { color: '#8b5cf6', glow: '0 0 8px rgba(139, 92, 246, 0.25)' },
  C: { color: 'var(--text-muted)', glow: 'none' },
};

const GRADE_LABEL: Record<QualityGrade, string> = {
  S: 'core protocol',
  A: 'high signal',
  B: 'ecosystem',
  C: 'aggregator',
};

const CATEGORIES = [
  'RESEARCH', 'EIP_ERC', 'PROTOCOL_CALLS', 'GOVERNANCE',
  'UPGRADE', 'ANNOUNCEMENT', 'METRICS', 'SECURITY',
] as const;

type FilterMode = 'grade' | 'category';

export function SourceList({ sources }: { sources: SourceRegistry[] }) {
  const { hiddenSources, toggleHideSource } = usePreferences();
  const [filterMode, setFilterMode] = useState<FilterMode>('grade');
  const [activeGrade, setActiveGrade] = useState<QualityGrade | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sorted = useMemo(() => {
    let filtered = [...sources];

    // Apply active filters
    if (activeGrade) {
      filtered = filtered.filter(s => (SOURCE_QUALITY[s.id] ?? 'C') === activeGrade);
    }
    if (activeCategory) {
      filtered = filtered.filter(s => s.default_category === activeCategory);
    }

    // Sort by grade then alphabetically
    return filtered.sort((a, b) => {
      const gradeA = SOURCE_QUALITY[a.id] ?? 'C';
      const gradeB = SOURCE_QUALITY[b.id] ?? 'C';
      const diff = GRADE_SORT_ORDER[gradeA] - GRADE_SORT_ORDER[gradeB];
      if (diff !== 0) return diff;
      return a.display_name.localeCompare(b.display_name);
    });
  }, [sources, activeGrade, activeCategory]);

  // Counts for filter pills
  const gradeCounts = useMemo(() => {
    const counts: Record<QualityGrade, number> = { S: 0, A: 0, B: 0, C: 0 };
    for (const s of sources) {
      const g = SOURCE_QUALITY[s.id] ?? 'C';
      counts[g]++;
    }
    return counts;
  }, [sources]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sources) {
      counts[s.default_category] = (counts[s.default_category] ?? 0) + 1;
    }
    return counts;
  }, [sources]);

  let lastGrade: QualityGrade | null = null;

  return (
    <div>
      {/* Filter mode toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => { setFilterMode('grade'); setActiveCategory(null); }}
          className="px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase"
          style={{
            background: filterMode === 'grade' ? 'var(--accent)' : 'transparent',
            color: filterMode === 'grade' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${filterMode === 'grade' ? 'var(--accent)' : 'var(--border-subtle)'}`,
          }}
        >
          by rank
        </button>
        <button
          onClick={() => { setFilterMode('category'); setActiveGrade(null); }}
          className="px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase"
          style={{
            background: filterMode === 'category' ? 'var(--accent)' : 'transparent',
            color: filterMode === 'category' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${filterMode === 'category' ? 'var(--accent)' : 'var(--border-subtle)'}`,
          }}
        >
          by category
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
        {filterMode === 'grade' ? (
          (['S', 'A', 'B', 'C'] as QualityGrade[]).map(grade => {
            const isActive = activeGrade === grade;
            const gs = GRADE_STYLE[grade];
            return (
              <button
                key={grade}
                onClick={() => setActiveGrade(isActive ? null : grade)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase"
                style={{
                  background: isActive ? gs.color : 'transparent',
                  color: isActive ? '#fff' : gs.color,
                  border: `1px solid ${isActive ? gs.color : 'var(--border-subtle)'}`,
                  textShadow: isActive ? 'none' : gs.glow,
                }}
              >
                [{grade}] {GRADE_LABEL[grade]} ({gradeCounts[grade]})
              </button>
            );
          })
        ) : (
          CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`whitespace-nowrap px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase ${CATEGORY_BADGE_CLASS[cat] ?? ''}`}
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#fff' : undefined,
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                }}
              >
                {CATEGORY_LABELS[cat] ?? cat} ({count})
              </button>
            );
          })
        )}
      </div>

      {/* Source count */}
      <div className="text-[9px] tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
        showing {sorted.length} of {sources.length} sources
      </div>

      {/* Source list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {sorted.map(source => {
          const hidden = hiddenSources.includes(source.id);
          const badgeClass = CATEGORY_BADGE_CLASS[source.default_category] ?? 'badge-research';
          const grade: QualityGrade = SOURCE_QUALITY[source.id] ?? 'C';
          const style = GRADE_STYLE[grade];
          const showDivider = grade !== lastGrade && !activeGrade;
          lastGrade = grade;

          return (
            <div key={source.id} className={showDivider ? 'col-span-full' : ''}>
              {showDivider && (
                <div className="flex items-center gap-2 pt-4 pb-2">
                  <span
                    className="text-[10px] font-semibold tracking-widest"
                    style={{ color: style.color, textShadow: style.glow }}
                  >
                    [{grade}]
                  </span>
                  <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                  <span className="text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                    {GRADE_LABEL[grade]}
                  </span>
                </div>
              )}
              <div
                className="flex items-center justify-between p-3 md:p-4 transition-all duration-200"
                style={{
                  background: hidden ? 'transparent' : 'var(--bg-card)',
                  border: hidden
                    ? '1px dashed var(--border-subtle)'
                    : '1px solid var(--border-medium)',
                  opacity: hidden ? 0.5 : 1,
                  boxShadow: hidden ? 'none' : '0 2px 12px rgba(0, 0, 0, 0.2)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="shrink-0 text-[9px] font-bold tracking-wider"
                      style={{ color: style.color, textShadow: style.glow }}
                    >
                      {grade}
                    </span>
                    <div
                      className="text-[12px] md:text-[13px] font-medium truncate"
                      style={{ color: hidden ? 'var(--text-muted)' : 'var(--text-primary)' }}
                    >
                      {source.display_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-5">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[9px] font-medium tracking-widest uppercase ${badgeClass}`}
                    >
                      {CATEGORY_LABELS[source.default_category] ?? source.default_category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleHideSource(source.id)}
                  className="btn-neon ml-3 shrink-0 px-3 py-1 text-[10px] font-medium tracking-widest uppercase"
                  style={{
                    color: hidden ? 'var(--text-muted)' : 'var(--accent)',
                    border: hidden
                      ? '1px solid var(--border-subtle)'
                      : '1px solid var(--accent)',
                    textShadow: hidden ? 'none' : '0 0 8px rgba(59, 130, 246, 0.2)',
                  }}
                >
                  [{hidden ? 'off' : 'on'}]
                </button>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="col-span-full py-8 text-center text-[11px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            [no sources match filter]
          </div>
        )}
      </div>
    </div>
  );
}
