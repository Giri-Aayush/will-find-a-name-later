'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import type { Card as CardType } from '@ethpulse/shared';
import { relativeTime, extractDomain, CATEGORY_LABELS, CATEGORY_BADGE_CLASS } from '@/lib/utils';
import { useSaved } from '@/stores/saved';
import { toast } from './toast';
import { capture } from '@/lib/posthog';

interface CardProps {
  card: CardType;
}

const FLAG_REASONS = [
  'Inaccurate information',
  'Spam or irrelevant',
  'Duplicate content',
  'Other',
] as const;

export function Card({ card }: CardProps) {
  const [flagged, setFlagged] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [flagStep, setFlagStep] = useState<'idle' | 'reason' | 'confirm' | 'done'>('idle');
  const [flagReason, setFlagReason] = useState('');
  const [flagCustom, setFlagCustom] = useState('');
  const shareRef = useRef<HTMLDivElement>(null);

  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const { isSaved, toggleSave, init, initialized } = useSaved();
  const saved = initialized && isSaved(card.id);
  const badgeClass = CATEGORY_BADGE_CLASS[card.category] ?? 'badge-research';
  const categoryLabel = CATEGORY_LABELS[card.category] ?? card.category;

  useEffect(() => {
    if (isSignedIn) init();
  }, [isSignedIn, init]);

  // Auto-dismiss thank you after 3s
  useEffect(() => {
    if (flagStep !== 'done') return;
    const t = setTimeout(() => setFlagStep('idle'), 3000);
    return () => clearTimeout(t);
  }, [flagStep]);

  // ── Share handlers ──

  // Card URL on our site (has OG image for rich previews)
  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/card/${card.id}`
    : `/card/${card.id}`;

  function shareOnX(e: React.MouseEvent) {
    e.stopPropagation();
    const text = `${card.headline}\n\n[${categoryLabel}] via EthPulse`;
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
    await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: card.id, reason: flagReason }),
    });
    setFlagged(true);
    setFlagStep('done');
    capture('card_flagged', { card_id: card.id, reason: flagReason });
  }

  // ── Save handler ──

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isSignedIn) {
      clerk.openSignIn();
      return;
    }
    const nowSaved = await toggleSave(card.id);
    capture(nowSaved ? 'card_saved' : 'card_unsaved', { card_id: card.id });
    toast(nowSaved ? 'Saved' : 'Removed from saved');
  }

  return (
    <article className="h-full flex flex-col px-5 py-5 relative">
      {/* ── Top: Category + Source + Time ── */}
      <div className="shrink-0 animate-in animate-delay-1">
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
          <span style={{ color: 'var(--accent)' }}>&gt;</span>
          <span>{relativeTime(card.published_at)}</span>
          {card.author && (
            <span>// {card.author}</span>
          )}
        </div>
      </div>

      {/* ── Main: Headline + Summary ── */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-6 animate-in animate-delay-2">
        {/* Terminal-style decorative divider */}
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-muted)' }}>
          <div className="h-px flex-1" style={{ background: 'var(--border-medium)' }} />
          <span className="text-[9px] tracking-widest uppercase">intel</span>
          <div className="h-px flex-1" style={{ background: 'var(--border-medium)' }} />
        </div>

        <h2
          className="text-[1.35rem] leading-[1.3] font-medium tracking-tight uppercase mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {card.headline}
        </h2>

        <p
          className="text-[13px] leading-[1.8] font-light"
          style={{ color: 'var(--text-secondary)' }}
        >
          {card.summary}
        </p>

        {/* Engagement metrics */}
        {card.engagement && (
          <div className="flex gap-4 mt-4 text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
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
      </div>

      {/* ── Bottom: CTA + Actions ── */}
      <div
        className="shrink-0 pt-4 animate-in animate-delay-3"
        style={{ borderTop: '1px solid var(--border-medium)' }}
      >
        {/* Read source button — sharp box */}
        <a
          href={card.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-[11px] font-medium uppercase tracking-widest transition-all hover:brightness-110"
          style={{
            background: 'var(--accent)',
            color: '#fff',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Read source
          <span className="text-[10px]">-&gt;</span>
        </a>

        {/* Action bar — terminal-style */}
        <div className="flex items-center gap-5 mt-3 pb-14 relative" ref={shareRef}>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase transition-colors"
            style={{ color: saved ? 'var(--accent)' : 'var(--text-muted)' }}
            title={saved ? 'Unsave' : 'Save'}
          >
            <span>[{saved ? '*' : ' '}]</span>
            {saved ? 'Saved' : 'Save'}
          </button>

          {/* Share button + popover */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShareOpen(!shareOpen); }}
              className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase transition-colors hover:opacity-80"
              style={{ color: shareOpen ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <span>[^]</span>
              Share
            </button>

            {shareOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => { e.stopPropagation(); setShareOpen(false); }}
                />
                {/* Menu */}
                <div
                  className="absolute bottom-full left-0 mb-2 z-50 py-1 min-w-[160px]"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <button
                    onClick={shareOnX}
                    className="w-full text-left px-3 py-2 text-[10px] font-medium tracking-wider uppercase transition-colors hover:brightness-125"
                    style={{ color: 'var(--accent)' }}
                  >
                    [x] share on x
                  </button>
                  <button
                    onClick={shareOnTelegram}
                    className="w-full text-left px-3 py-2 text-[10px] font-medium tracking-wider uppercase transition-colors hover:brightness-125"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    [t] telegram
                  </button>
                  <button
                    onClick={copyLink}
                    className="w-full text-left px-3 py-2 text-[10px] font-medium tracking-wider uppercase transition-colors hover:brightness-125"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    [c] copy link
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleFlagClick}
            className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase transition-colors"
            style={{ color: flagged ? 'var(--accent-red)' : 'var(--text-muted)' }}
            disabled={flagged}
          >
            <span>[!]</span>
            {flagged ? 'Flagged' : 'Flag'}
          </button>
        </div>
      </div>

      {/* ── Flag overlay ── */}
      {flagStep !== 'idle' && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(8, 8, 12, 0.92)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step 1: Reason */}
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
                    className="w-full text-left px-4 py-2.5 text-[10px] font-medium tracking-wider uppercase transition-colors hover:brightness-125"
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
                  className="text-[10px] font-medium tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  [esc] cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
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
                  className="px-4 py-2 text-[10px] font-medium tracking-widest uppercase transition-all hover:brightness-110"
                  style={{ background: 'var(--accent-red)', color: '#fff' }}
                >
                  [yes] submit flag
                </button>
                <button
                  onClick={() => setFlagStep('idle')}
                  className="px-4 py-2 text-[10px] font-medium tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border-medium)' }}
                >
                  [no] cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Thank you */}
          {flagStep === 'done' && (
            <div
              className="w-full max-w-sm cursor-pointer"
              style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}
              onClick={() => setFlagStep('idle')}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--accent-green)' }}>
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
}
