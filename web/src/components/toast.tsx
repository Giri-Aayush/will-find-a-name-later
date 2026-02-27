'use client';

import { useEffect, useState } from 'react';

let showToastFn: ((msg: string) => void) | null = null;

export function toast(message: string) {
  showToastFn?.(message);
}

export function ToastProvider() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    showToastFn = (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 2000);
    };
    return () => { showToastFn = null; };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-200 shadow-lg">
      {message}
    </div>
  );
}
