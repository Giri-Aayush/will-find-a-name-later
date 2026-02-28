'use client';

import { memo, useEffect, useState, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import type { Card as CardType } from '@hexcast/shared';
import { relativeTime, extractDomain, CATEGORY_LABELS, CATEGORY_BADGE_CLASS } from '@/lib/utils';
import { useSaved } from '@/stores/saved';
import { useReactions } from '@/stores/reactions';
import { toast } from './toast';
import { capture } from '@/lib/posthog';

interface CardProps {
  card: CardType & { seen?: boolean };
}

const FLAG_REASONS = [
  'Inaccurate information',
  'Spam or irrelevant',
  'Duplicate content',
  'Other',
] as const;

export const Card = memo(function Card({ card }: CardProps) {
  const [flagged, setFlagged] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [flagStep, setFlagStep] = useState<'idle' | 'reason' | 'confirm' | 'done'>('idle');
  const [flagReason, setFlagReason] = useState('');
  const [flagCustom, setFlagCustom] = useState('');
  const [reactionPop, setReactionPop] = useState<'up' | 'down' | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const { isSaved, toggleSave, initialized } = useSaved();
  const { getUserReaction, getCounts, react } = useReactions();
  const saved = initialized && isSaved(card.id);
  const userReaction = getUserReaction(card.id);
  const counts = getCounts(card.id);
  const badgeClass = CATEGORY_BADGE_CLASS[card.category] ?? 'badge-research';
  const categoryLabel = CATEGORY_LABELS[card.category] ?? card.category;

  // Auto-dismiss thank you after 3s
  useEffect(() => {
    if (flagStep !== 'done') return;
    const t = setTimeout(() => setFlagStep('idle'), 3000);
    return () => clearTimeout(t);
  }, [flagStep]);

  // ── Share handlers ──

  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/card/${card.id}`
    : `/card/${card.id}`;

  function shareOnX(e: React.MouseEvent) {
    e.stopPropagation();
    const text = `${card.headline}\n\n[${categoryLabel}] via Hexcast`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(cardUrl)}`;
    window.open(url, '_blank', 'noopener');
    capture('card_shared', { card_id: card.id, platform: 'x' });
    setShareOpen(false);
  }

  function shareOnTelegram(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `https://t.me/share/url?url=${encodeURIComponent(cardUrl)}&text=${encodeURIComponent(card.headline)}`;
    window.open(url, '_blank', 'noopener');
    capture('card_shared', { card_id: card.id, platform: 'telegram' });
    setShareOpen(false);
  }

  async function copyLink(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(`${card.headline}\n${cardUrl}`);
    toast('Copied to clipboard');
    capture('card_shared', { card_id: card.id, platform: 'copy' });
    setShareOpen(false);
  }

  // ── Flag handlers ──

  function handleFlagClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (flagged) return;
    if (isSignedIn === false) {
      clerk.openSignIn();
      return;
    }
    if (!isSignedIn) return;
    setFlagStep('reason');
    setFlagReason('');
    setFlagCustom('');
  }

  function selectReason(reason: string) {
    setFlagReason(reason);
    if (reason !== 'Other') {
      setFlagStep('confirm');
    }
  }

  function confirmOtherReason() {
    if (flagCustom.trim()) {
      setFlagReason(flagCustom.trim());
      setFlagStep('confirm');
    }
  }

  async function submitFlag() {
    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, reason: flagReason }),
      });
      if (!res.ok) throw new Error('Failed');
      setFlagged(true);
      setFlagStep('done');
      capture('card_flagged', { card_id: card.id, reason: flagReason });
    } catch {
      toast('Failed to flag — try again');
      setFlagStep('idle');
    }
  }

  // ── Reaction handler ──

  async function handleReaction(e: React.MouseEvent, type: 'up' | 'down') {
    e.stopPropagation();
    if (isSignedIn === false) {
      clerk.openSignIn();
      return;
    }
    if (!isSignedIn) return;
    navigator.vibrate?.(10);
    setReactionPop(type);
    setTimeout(() => setReactionPop(null), 300);
    await react(card.id, type);
    capture('card_reacted', { card_id: card.id, reaction: type });
  }

  // ── Save handler ──

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (isSignedIn === false) {
      clerk.openSignIn();
      return;
    }
    if (!isSignedIn) return;
    try {
      const nowSaved = await toggleSave(card.id, card);
      capture(nowSaved ? 'card_saved' : 'card_unsaved', { card_id: card.id });
      toast(nowSaved ? 'Saved' : 'Removed from saved');
    } catch {
      toast('Failed to save — try again');
    }
  }

  return (
    <article
      className={`card-ambient h-full flex flex-col px-5 py-5 relative ${card.seen === false ? 'unseen-indicator' : ''}`}
      data-category={card.category}
    >
      {/* ── Bookmark ribbon (top-right) ── */}
      <button
        onClick={handleSave}
        className="absolute top-0 right-6 z-10 btn-neon animate-in"
        style={{
          filter: saved ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none',
        }}
        title={saved ? 'Unsave' : 'Save'}
      >
        <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
          <path
            d="M0 0H22V30L11 23L0 30V0Z"
            fill={saved ? 'var(--accent)' : 'rgba(255, 255, 255, 0.06)'}
            stroke={saved ? 'var(--accent)' : 'rgba(255, 255, 255, 0.15)'}
            strokeWidth="1"
          />
          {!saved && (
            <path
              d="M8 10L10 12L14 8"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {saved && (
            <path
              d="M8 10L10 12L14 8"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>

      {/* ── Top: Category + Source + Time ── */}
      <div className="shrink-0 animate-in animate-delay-1 relative z-1">
        <div className="flex items-center gap-3">
          <span className={`inline-block px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase ${badgeClass}`}>
            {categoryLabel}
          </span>
          <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            {extractDomain(card.canonical_url)}
          </span>
        </div>
        <div
          className="mt-2 flex items-center gap-2 text-[10px] tracking-wider uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          <span style={{ color: 'var(--accent)' }} className="text-glow-accent">&gt;</span>
          <span>{relativeTime(card.published_at)}</span>
          {card.author && (
            <span>// {card.author}</span>
          )}
        </div>
      </div>

      {/* ── Main: Headline + Summary ── */}
      <div className="card-summary flex-1 flex flex-col justify-center min-h-0 py-5 animate-in animate-delay-2 relative z-1">
        {/* Terminal-style decorative divider */}
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-muted)' }}>
          <div className="h-px flex-1" style={{ background: 'var(--border-medium)' }} />
          <span className="text-[10px] tracking-widest uppercase">intel</span>
          <div className="h-px flex-1" style={{ background: 'var(--border-medium)' }} />
        </div>

        <h2
          className="text-[1.4rem] leading-[1.35] font-semibold tracking-tight uppercase mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {card.headline}
        </h2>

        <p
          className="text-[13px] font-light leading-[1.8]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {card.summary}
        </p>

        {/* Engagement metrics + Share */}
        <div className="flex items-center gap-4 mt-4" ref={shareRef}>
          {card.engagement && (
            <div className="flex gap-4 text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              {card.engagement.likes != null && (
                <span>[{card.engagement.likes.toLocaleString()} likes]</span>
              )}
              {card.engagement.replies != null && (
                <span>[{card.engagement.replies.toLocaleString()} replies]</span>
              )}
              {card.engagement.views != null && (
                <span>[{card.engagement.views.toLocaleString()} views]</span>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Share (paper plane) */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShareOpen(!shareOpen); }}
              className="btn-neon p-1.5"
              style={{
                color: shareOpen ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>

            {shareOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 animate-fade-in"
                  onClick={(e) => { e.stopPropagation(); setShareOpen(false); }}
                />
                <div
                  className="absolute bottom-full right-0 mb-2 z-50 py-1 min-w-[180px] animate-slide-up"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <button
                    onClick={shareOnX}
                    className="btn-neon w-full text-left px-3 py-2.5 text-[10px] font-medium tracking-wider uppercase"
                    style={{ color: 'var(--accent)' }}
                  >
                    [x] share on x
                  </button>
                  <button
                    onClick={shareOnTelegram}
                    className="btn-neon w-full text-left px-3 py-2.5 text-[10px] font-medium tracking-wider uppercase"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    [t] telegram
                  </button>
                  <button
                    onClick={copyLink}
                    className="btn-neon w-full text-left px-3 py-2.5 text-[10px] font-medium tracking-wider uppercase"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    [c] copy link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom: Read Source + Reactions (single row) ── */}
      <div
        className="card-actions shrink-0 pt-4 pb-14 animate-in animate-delay-3 relative z-1"
        style={{ borderTop: '1px solid var(--border-medium)' }}
      >
        <div className="flex items-center">
          <a
            href={card.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-widest transition-all hover:brightness-110"
            style={{
              background: 'var(--accent)',
              color: '#fff',
            }}
            onClick={(e) => {
              e.stopPropagation();
              capture('source_clicked', { card_id: card.id, url: card.canonical_url });
            }}
          >
            Read source
            <span className="text-[10px]">-&gt;</span>
          </a>

          <div className="flex-1" />

          <button
            onClick={(e) => handleReaction(e, 'up')}
            className={`reaction-btn flex items-center gap-1.5 px-2 py-1.5 ${reactionPop === 'up' ? 'reaction-pop' : ''}`}
            style={{
              color: userReaction === 'up' ? 'var(--accent-green)' : 'var(--text-muted)',
              filter: userReaction === 'up' ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.4))' : 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={userReaction === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {counts.up >= 3 && <span className="text-[9px] font-medium tabular-nums">{counts.up}</span>}
          </button>
          <button
            onClick={(e) => handleReaction(e, 'down')}
            className={`reaction-btn flex items-center gap-1.5 px-2 py-1.5 ${reactionPop === 'down' ? 'reaction-pop' : ''}`}
            style={{
              color: userReaction === 'down' ? 'var(--accent-red)' : 'var(--text-muted)',
              filter: userReaction === 'down' ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))' : 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={userReaction === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
              <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
            </svg>
            {counts.down >= 3 && <span className="text-[9px] font-medium tabular-nums">{counts.down}</span>}
          </button>
          <button
            onClick={handleFlagClick}
            className="btn-neon px-2 py-1.5"
            style={{
              color: flagged ? 'var(--accent-red)' : 'var(--text-muted)',
              filter: flagged ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))' : 'none',
            }}
            disabled={flagged}
            title="Report"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={flagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Flag overlay ── */}
      {flagStep !== 'idle' && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(6, 6, 10, 0.94)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {flagStep === 'reason' && (
            <div className="w-full max-w-sm" style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
                  why are you flagging this?
                </span>
              </div>
              <div className="py-1">
                {FLAG_REASONS.map((reason, i) => (
                  <button
                    key={reason}
                    onClick={() => selectReason(reason)}
                    className="btn-neon w-full text-left px-4 py-2.5 text-[10px] font-medium tracking-wider uppercase"
                    style={{ color: flagReason === reason && reason === 'Other' ? 'var(--accent)' : 'var(--text-secondary)' }}
                  >
                    [{i + 1}] {reason}
                  </button>
                ))}
                {flagReason === 'Other' && (
                  <div className="px-4 pb-3 flex gap-2">
                    <input
                      type="text"
                      value={flagCustom}
                      onChange={(e) => setFlagCustom(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmOtherReason(); }}
                      placeholder="describe the issue..."
                      autoFocus
                      className="flex-1 px-2 py-1.5 text-[10px] tracking-wider uppercase outline-none"
                      style={{
                        background: 'var(--bg-deep)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      onClick={confirmOtherReason}
                      className="px-3 py-1.5 text-[10px] font-medium tracking-wider uppercase"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      ok
                    </button>
                  </div>
                )}
              </div>
              <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setFlagStep('idle')}
                  className="btn-neon text-[10px] font-medium tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  [esc] cancel
                </button>
              </div>
            </div>
          )}

          {flagStep === 'confirm' && (
            <div className="w-full max-w-sm" style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
                  confirm flag
                </span>
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to flag this card?
                </p>
                <p className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                  reason: {flagReason}
                </p>
              </div>
              <div className="flex gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={submitFlag}
                  className="btn-cta px-4 py-2 text-[10px] font-medium tracking-widest uppercase"
                  style={{ background: 'var(--accent-red)', color: '#fff' }}
                >
                  [yes] submit flag
                </button>
                <button
                  onClick={() => setFlagStep('idle')}
                  className="btn-neon px-4 py-2 text-[10px] font-medium tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border-medium)' }}
                >
                  [no] cancel
                </button>
              </div>
            </div>
          )}

          {flagStep === 'done' && (
            <div
              className="w-full max-w-sm cursor-pointer"
              style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}
              onClick={() => setFlagStep('idle')}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-[11px] font-medium tracking-widest uppercase text-glow-green" style={{ color: 'var(--accent-green)' }}>
                  flag submitted
                </span>
              </div>
              <div className="px-4 py-5">
                <p className="text-[12px] leading-[1.8] mb-3" style={{ color: 'var(--text-primary)' }}>
                  Thanks for your feedback.
                </p>
                <p className="text-[11px] leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
                  We are actively working to improve your feed and experience. Your contribution means a lot to us.
                </p>
              </div>
              <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <span className="text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                  tap to dismiss
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
});
