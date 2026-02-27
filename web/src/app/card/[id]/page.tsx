import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCardById } from '@/lib/queries';
import { CATEGORY_LABELS } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = await getCardById(id);

  if (!card) {
    return { title: 'Card not found — EthPulse' };
  }

  const categoryLabel = CATEGORY_LABELS[card.category] ?? card.category;
  const description = card.summary.length > 200 ? card.summary.slice(0, 200) + '...' : card.summary;
  const ogImageUrl = `/api/og?id=${id}`;

  return {
    title: `${card.headline} — EthPulse`,
    description,
    openGraph: {
      title: card.headline,
      description,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: card.headline,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: card.headline,
      description: `[${categoryLabel}] ${description}`,
      images: [ogImageUrl],
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = await getCardById(id);

  if (!card) {
    notFound();
  }

  const categoryLabel = CATEGORY_LABELS[card.category] ?? card.category;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--bg-deep)' }}
    >
      <div
        className="w-full max-w-lg"
        style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <span
            className="text-[10px] font-medium tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            {categoryLabel}
          </span>
          <span
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--accent)' }}>[</span>
            EthPulse
            <span style={{ color: 'var(--accent)' }}>]</span>
          </span>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <h1
            className="text-xl leading-tight font-medium tracking-tight uppercase mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {card.headline}
          </h1>
          <p
            className="text-[13px] leading-[1.8] font-light"
            style={{ color: 'var(--text-secondary)' }}
          >
            {card.summary}
          </p>
        </div>

        {/* CTA */}
        <div className="px-5 py-4 flex items-center gap-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <a
            href={card.canonical_url}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium uppercase tracking-widest transition-all hover:brightness-110"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Read source
            <span className="text-[10px]">-&gt;</span>
          </a>
          <a
            href="/"
            className="text-[10px] font-medium tracking-widest uppercase transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border-medium)', padding: '8px 16px' }}
          >
            Browse feed
          </a>
        </div>
      </div>

      {/* Footer branding */}
      <p className="mt-6 text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
        Ethereum ecosystem intelligence
      </p>
    </main>
  );
}
