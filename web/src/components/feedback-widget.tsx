'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from './toast';
import { capture } from '@/lib/posthog';

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isSignedIn } = useUser();

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Only show for signed-in users
  if (!isSignedIn) return null;

  async function handleSubmit() {
    if (!message.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          page_url: window.location.pathname,
        }),
      });

      if (res.ok) {
        capture('feedback_submitted', { length: message.trim().length });
        toast('Thanks for the feedback');
        setMessage('');
        setOpen(false);
      }
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Trigger button — bottom-right, above bottom nav */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-40 text-[10px] font-medium tracking-widest uppercase transition-all hover:brightness-125"
          style={{
            bottom: 'calc(60px + max(0.5rem, env(safe-area-inset-bottom)))',
            right: '16px',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 10px',
            background: 'rgba(8, 8, 12, 0.9)',
            backdropFilter: 'blur(4px)',
          }}
        >
          [~] feedback
        </button>
      )}

      {/* Slide-up sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 animate-fade-in"
            style={{ background: 'rgba(8, 8, 12, 0.6)' }}
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className="fixed left-0 right-0 z-50 px-4 pb-4 animate-slide-up"
            style={{
              bottom: 'calc(52px + max(0.5rem, env(safe-area-inset-bottom)))',
            }}
          >
            <div
              className="mx-auto max-w-lg"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span
                  className="text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: 'var(--text-primary)' }}
                >
                  send feedback
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[10px] tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  [esc]
                </button>
              </div>

              {/* Input */}
              <div className="p-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  placeholder="what's on your mind?"
                  rows={3}
                  autoFocus
                  className="w-full resize-none px-3 py-2 text-[11px] leading-relaxed tracking-wider outline-none"
                  style={{
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-[9px] tracking-wider tabular-nums"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {message.length}/500
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || submitting}
                    className="px-4 py-1.5 text-[10px] font-medium tracking-widest uppercase transition-all hover:brightness-110 disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    [send]
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
