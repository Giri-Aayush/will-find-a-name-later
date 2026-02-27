'use client';

import { useEffect, useState } from 'react';

let showToastFn: ((msg: string) => void) | null = null;

export function toast(message: string) {
  showToastFn?.(message);
}

export function ToastProvider() {
  const [message, setMessage] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    showToastFn = (msg: string) => {
      setExiting(false);
      setMessage(msg);
    };
    return () => { showToastFn = null; };
  }, []);

  useEffect(() => {
    if (!message || exiting) return;
    const exitTimer = setTimeout(() => setExiting(true), 2000);
    return () => clearTimeout(exitTimer);
  }, [message, exiting]);

  useEffect(() => {
    if (!exiting) return;
    const removeTimer = setTimeout(() => {
      setMessage(null);
      setExiting(false);
    }, 200);
    return () => clearTimeout(removeTimer);
  }, [exiting]);

  if (!message) return null;

  return (
    <div
      className={`fixed z-50 left-1/2 -translate-x-1/2 px-4 py-2 text-[10px] font-medium tracking-widest uppercase ${
        exiting ? 'animate-fade-out' : 'animate-slide-up'
      }`}
      style={{
        bottom: 'calc(60px + max(0.5rem, env(safe-area-inset-bottom)))',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)',
        color: 'var(--text-primary)',
      }}
    >
      <span style={{ color: 'var(--accent)' }}>[&gt;]</span> {message}
    </div>
  );
}
