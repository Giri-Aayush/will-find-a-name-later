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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass"
      style={{
        borderTop: '1px solid var(--border-medium)',
      }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="btn-neon flex flex-col items-center justify-center gap-0.5 px-3 py-1"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '10px',
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.1em',
                textShadow: active ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              <span className="text-[12px]">{item.icon}</span>
              <span className="uppercase">{item.label}</span>
              {active && <div className="nav-glow-dot" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
