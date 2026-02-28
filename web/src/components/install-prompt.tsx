'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const dismissed = localStorage.getItem('ethpulse-install-dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      // Delay showing by 30s so user engages with content first
      setTimeout(() => setShow(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    deferredPrompt.current = null;
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem('ethpulse-install-dismissed', String(Date.now()));
    deferredPrompt.current = null;
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed z-50 left-4 right-4 animate-slide-up"
      style={{
        bottom: 'calc(72px + max(0.5rem, env(safe-area-inset-bottom)))',
      }}
    >
      <div
        className="glass"
        style={{
          border: '1px solid var(--border-medium)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--accent)', marginBottom: '2px' }}
          >
            install app
          </div>
          <div
            className="text-[9px] tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            add ethpulse to home screen for instant access
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="btn-cta shrink-0 px-3 py-1.5 text-[9px] font-medium tracking-widest uppercase"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
          }}
        >
          install
        </button>
        <button
          onClick={handleDismiss}
          className="btn-neon shrink-0 text-[11px]"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
