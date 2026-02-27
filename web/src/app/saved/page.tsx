'use client';

import { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { useSaved } from '@/stores/saved';
import { Card } from '@/components/card';

function SavedCards() {
  const { isSignedIn } = useUser();
  const { savedCards, initialized, init } = useSaved();

  useEffect(() => {
    if (isSignedIn) init();
  }, [isSignedIn, init]);

  if (!initialized) {
    return (
      <div className="py-12 text-center text-[11px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
        <span className="cursor-blink">loading...</span>
      </div>
    );
  }

  if (savedCards.length === 0) {
    return (
      <div className="py-12 text-center text-[11px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
        [no saved cards yet]
        <br />
        <span className="mt-2 block text-[10px]" style={{ color: 'var(--text-muted)' }}>
          tap [*] on any card to save it
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedCards.map(card => (
        <div
          key={card.id}
          className="p-4"
          style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-card)' }}
        >
          <Card card={card} />
        </div>
      ))}
    </div>
  );
}

export default function SavedPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-6 pb-24">
      <h1
        className="text-sm font-medium tracking-widest uppercase mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        <span style={{ color: 'var(--accent)' }}>[</span>
        saved
        <span style={{ color: 'var(--accent)' }}>]</span>
      </h1>

      <SignedIn>
        <SavedCards />
      </SignedIn>

      <SignedOut>
        <div className="py-16 text-center">
          <div className="text-[11px] tracking-widest uppercase mb-6" style={{ color: 'var(--text-muted)' }}>
            [authentication required]
          </div>
          <p className="text-[12px] mb-6" style={{ color: 'var(--text-secondary)' }}>
            Sign in to save cards and access them across devices.
          </p>
          <SignInButton mode="modal">
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium uppercase tracking-widest transition-all hover:brightness-110"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              sign in
              <span className="text-[10px]">-&gt;</span>
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </main>
  );
}
