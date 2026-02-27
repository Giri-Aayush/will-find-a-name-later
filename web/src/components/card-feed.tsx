'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import type { Card as CardType } from '@ethpulse/shared';
import { Card } from './card';
import { capture } from '@/lib/posthog';

interface CardFeedProps {
  initialCards: CardType[];
}

export function CardFeed({ initialCards }: CardFeedProps) {
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [hasMore, setHasMore] = useState(initialCards.length === 20);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const lastCard = cards[cards.length - 1];
    const params = new URLSearchParams();
    if (lastCard) params.set('cursor', lastCard.published_at);
    if (category) params.set('category', category);

    const res = await fetch(`/api/cards?${params}`);
    const data = await res.json();

    setCards(prev => [...prev, ...data.cards]);
    setHasMore(data.hasMore);
    setLoading(false);
  }, [cards, hasMore, loading, category]);

  // Track current card + preload near end
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) {
              setCurrentIndex(idx);
              if (idx >= cards.length - 5) loadMore();
            }
          }
        }
      },
      { root: container, threshold: 0.6 }
    );

    const items = container.querySelectorAll('[data-index]');
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [cards, loadMore]);

  const handleCategoryChange = useCallback(async (newCategory: string | null) => {
    setCategory(newCategory);
    setCurrentIndex(0);
    setLoading(true);

    const params = new URLSearchParams();
    if (newCategory) params.set('category', newCategory);

    const res = await fetch(`/api/cards?${params}`);
    const data = await res.json();

    setCards(data.cards);
    setHasMore(data.hasMore);
    setLoading(false);
    containerRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--bg-deep)' }}>
      {/* ── Header ── */}
      <header
        className="shrink-0 z-10"
        style={{
          background: 'rgba(8, 8, 12, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-medium)',
        }}
      >
        <div className="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
          <h1
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--accent)' }}>[</span>
            EthPulse
            <span style={{ color: 'var(--accent)' }}>]</span>
          </h1>
          <div className="flex items-center gap-3">
            {cards.length > 0 && (
              <span
                className="text-[10px] tabular-nums tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {String(currentIndex + 1).padStart(2, '0')}/{String(cards.length).padStart(2, '0')}
              </span>
            )}
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-6 h-6',
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="text-[10px] font-medium tracking-widest uppercase px-2 py-1 transition-colors"
                  style={{
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                  }}
                >
                  sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
        <CategoryFilter active={category} onChange={handleCategoryChange} />
      </header>

      {/* ── Card snap-scroll area ── */}
      <div ref={containerRef} className="snap-container flex-1 min-h-0">
        {cards.map((card, idx) => (
          <div key={card.id} data-index={idx} className="snap-item h-full">
            <Card card={card} />
          </div>
        ))}

        {loading && (
          <div className="snap-item h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] tracking-wider uppercase cursor-blink" style={{ color: 'var(--text-muted)' }}>
                Loading
              </span>
            </div>
          </div>
        )}

        {!hasMore && cards.length > 0 && (
          <div className="snap-item h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
                [end of feed]
              </div>
              <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                No more cards to show
              </div>
            </div>
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-[11px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              [no cards found]
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryFilter({ active, onChange }: { active: string | null; onChange: (cat: string | null) => void }) {
  const categories = [
    'RESEARCH', 'EIP_ERC', 'PROTOCOL_CALLS', 'GOVERNANCE',
    'UPGRADE', 'ANNOUNCEMENT', 'METRICS', 'SECURITY',
  ];

  const labels: Record<string, string> = {
    RESEARCH: 'Research',
    EIP_ERC: 'EIP/ERC',
    PROTOCOL_CALLS: 'Protocol',
    GOVERNANCE: 'Governance',
    UPGRADE: 'Upgrade',
    ANNOUNCEMENT: 'News',
    METRICS: 'Metrics',
    SECURITY: 'Security',
  };

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide px-5 pb-2.5">
      {categories.map(cat => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => {
              const newCat = isActive ? null : cat;
              capture('category_filtered', { category: newCat });
              onChange(newCat);
            }}
            className="whitespace-nowrap px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase transition-all"
            style={{
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            {labels[cat] ?? cat}
          </button>
        );
      })}
    </div>
  );
}
