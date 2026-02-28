import type { Metadata } from 'next';
import { getSources } from '@/lib/queries';
import { SourceList } from '@/components/source-list';

export const metadata: Metadata = {
  title: 'Sources — Hexcast',
  description: 'All 88 Ethereum sources Hexcast monitors: protocol forums, client repos, governance portals, security researchers, L2 blogs, and on-chain metrics.',
  openGraph: {
    title: 'Sources — Hexcast',
    description: 'All 88 Ethereum sources Hexcast monitors across 17 tiers.',
  },
};

export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const sources = await getSources();
  return (
    <main className="px-5 md:px-10 lg:px-16 py-6 pb-24 h-dvh overflow-y-auto">
      <h1
        className="text-sm font-semibold tracking-widest uppercase mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        <span className="text-glow-accent" style={{ color: 'var(--accent)' }}>[</span>
        sources
        <span className="text-glow-accent" style={{ color: 'var(--accent)' }}>]</span>
      </h1>
      <p
        className="text-[10px] tracking-wider uppercase mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        {sources.length} active sources // toggle visibility to customize your feed
      </p>
      <SourceList sources={sources} />
    </main>
  );
}
