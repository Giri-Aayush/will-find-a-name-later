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
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // First-time swipe hint
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem('ethpulse-swipe-hint');
    if (!seen && initialCards.length > 0) {
      setShowSwipeHint(true);
    }
  }, [initialCards.length]);

  // Dismiss hint on first scroll
  useEffect(() => {
    if (!showSwipeHint) return;
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      setShowSwipeHint(false);
      localStorage.setItem('ethpulse-swipe-hint', '1');
    };
    container.addEventListener('scroll', onScroll, { once: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [showSwipeHint]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(false);

    try {
      const lastCard = cards[cards.length - 1];
      const params = new URLSearchParams();
      if (lastCard) params.set('cursor', lastCard.published_at);
      if (category) params.set('category', category);

      const res = await fetch(`/api/cards?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setCards(prev => [...prev, ...data.cards]);
      setHasMore(data.hasMore);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cards, hasMore, loading, category]);

  // Track viewed card IDs to avoid duplicate events
  const viewedRef = useRef(new Set<string>());
  // Track dwell start time per card
  const dwellStartRef = useRef<{ cardId: string; time: number } | null>(null);

  // Track current card + preload near end + analytics
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number(entry.target.getAttribute('data-index'));
          if (isNaN(idx)) continue;

          if (entry.isIntersecting) {
            setCurrentIndex(idx);
            if (idx >= cards.length - 5) loadMore();

            // card_viewed — fire once per card per session
            const card = cards[idx];
            if (card && !viewedRef.current.has(card.id)) {
              viewedRef.current.add(card.id);
              capture('card_viewed', {
                card_id: card.id,
                category: card.category,
                position: idx,
              });
            }

            // Start dwell timer
            if (card) {
              dwellStartRef.current = { cardId: card.id, time: Date.now() };
            }
          } else {
            // Card left viewport — emit dwell time
            const card = cards[idx];
            if (card && dwellStartRef.current?.cardId === card.id) {
              const duration = Math.round((Date.now() - dwellStartRef.current.time) / 1000);
              if (duration >= 1) {
                capture('card_dwell', {
                  card_id: card.id,
                  category: card.category,
                  duration_seconds: duration,
                });
              }
              dwellStartRef.current = null;
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

  // Pull-to-refresh
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container && container.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback(async (e: React.TouchEvent) => {
    if (touchStartY.current === null || refreshing) return;
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;

    if (diff > 80) {
      setRefreshing(true);
      capture('feed_refreshed');
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        const res = await fetch(`/api/cards?${params}`);
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards);
          setHasMore(data.hasMore);
          setCurrentIndex(0);
          containerRef.current?.scrollTo({ top: 0 });
        }
      } catch {
        // Silent fail
      } finally {
        setRefreshing(false);
      }
    }
  }, [category, refreshing]);

  const handleCategoryChange = useCallback(async (newCategory: string | null) => {
    setCategory(newCategory);
    setCurrentIndex(0);
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams();
      if (newCategory) params.set('category', newCategory);

      const res = await fetch(`/api/cards?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setCards(data.cards);
      setHasMore(data.hasMore);
      containerRef.current?.scrollTo({ top: 0 });
    } catch {
      setCards([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  function scrollToTop() {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentIndex(0);
  }

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

      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div
          className="shrink-0 flex items-center justify-center py-2"
          style={{ background: 'var(--bg-surface)' }}
        >
          <span className="text-[10px] tracking-widest uppercase cursor-blink" style={{ color: 'var(--accent)' }}>
            refreshing
          </span>
        </div>
      )}

      {/* ── Card snap-scroll area ── */}
      <div
        ref={containerRef}
        className="snap-container flex-1 min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {cards.map((card, idx) => (
          <div key={card.id} data-index={idx} className="snap-item h-full">
            <Card card={card} />
            {/* Swipe hint on first card */}
            {idx === 0 && showSwipeHint && (
              <div
                className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-1 animate-in"
                style={{ pointerEvents: 'none' }}
              >
                <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                  swipe up for more
                </span>
                <span className="text-lg animate-in" style={{ color: 'var(--text-muted)', animationDelay: '0.3s' }}>
                  ↑
                </span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="snap-item h-full flex items-center justify-center">
            <CardSkeleton />
          </div>
        )}

        {error && !loading && (
          <div className="snap-item h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--accent-red)' }}>
                [error] failed to load cards
              </div>
              <button
                onClick={loadMore}
                className="px-4 py-2 text-[10px] font-medium tracking-widest uppercase transition-all hover:brightness-110"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                [retry]
              </button>
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
                no more cards to show
              </div>
            </div>
          </div>
        )}

        {!loading && !error && cards.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                [no cards found]
              </div>
              <div className="text-[10px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {category ? 'try removing the category filter' : 'check back later for new intel'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll-to-top button */}
      {currentIndex > 2 && (
        <button
          onClick={scrollToTop}
          className="fixed z-30 px-2.5 py-2 text-[11px] font-medium tracking-widest uppercase transition-all animate-fade-in hover:brightness-125"
          style={{
            right: '16px',
            bottom: 'calc(60px + max(0.5rem, env(safe-area-inset-bottom)))',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-muted)',
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

/* ── Skeleton Card ── */
function CardSkeleton() {
  return (
    <div className="h-full flex flex-col px-5 py-5 animate-in">
      {/* Top */}
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <div className="skeleton h-4 w-20" style={{ opacity: 0.4 }} />
          <div className="skeleton h-3 w-24" style={{ opacity: 0.3 }} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="skeleton h-3 w-16" style={{ opacity: 0.2 }} />
        </div>
      </div>

      {/* Middle */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-6">
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-muted)' }}>
          <div className="h-px flex-1" style={{ background: 'var(--border-medium)' }} />
          <span className="text-[9px] tracking-widest uppercase">intel</span>
          <div className="h-px flex-1" style={{ background: 'var(--border-medium)' }} />
        </div>
        <div className="space-y-2 mb-4">
          <div className="skeleton h-6 w-full" style={{ opacity: 0.3 }} />
          <div className="skeleton h-6 w-3/4" style={{ opacity: 0.25 }} />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" style={{ opacity: 0.15 }} />
          <div className="skeleton h-4 w-full" style={{ opacity: 0.15 }} />
          <div className="skeleton h-4 w-2/3" style={{ opacity: 0.15 }} />
        </div>
      </div>

      {/* Bottom */}
      <div className="shrink-0 pt-4" style={{ borderTop: '1px solid var(--border-medium)' }}>
        <div className="skeleton h-9 w-32" style={{ opacity: 0.2 }} />
        <div className="flex items-center gap-4 mt-3 pb-14">
          <div className="skeleton h-4 w-14" style={{ opacity: 0.15 }} />
          <div className="skeleton h-4 w-10" style={{ opacity: 0.15 }} />
          <div className="skeleton h-4 w-12" style={{ opacity: 0.15 }} />
        </div>
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
            className="whitespace-nowrap px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase transition-all duration-150"
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
