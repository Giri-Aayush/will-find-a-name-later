'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Feed', icon: '[]' },
  { href: '/saved', label: 'Saved', icon: '[*]' },
  { href: '/sources', label: 'Sources', icon: '[:]' },
  { href: '/about', label: 'About', icon: '[?]' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(8, 8, 12, 0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid var(--border-medium)',
      }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 transition-colors"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '10px',
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.1em',
              }}
            >
              <span className="text-[13px]">{item.icon}</span>
              <span className="uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
