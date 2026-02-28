import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getCardById } from '@/lib/queries';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  RESEARCH: { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
  EIP_ERC: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  PROTOCOL_CALLS: { bg: 'rgba(168, 85, 247, 0.12)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
  GOVERNANCE: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  UPGRADE: { bg: 'rgba(34, 197, 94, 0.12)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  ANNOUNCEMENT: { bg: 'rgba(244, 114, 182, 0.12)', text: '#f472b6', border: 'rgba(244, 114, 182, 0.3)' },
  METRICS: { bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  SECURITY: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
};

const CATEGORY_LABELS: Record<string, string> = {
  RESEARCH: 'Research',
  EIP_ERC: 'EIP/ERC',
  PROTOCOL_CALLS: 'Protocol Calls',
  GOVERNANCE: 'Governance',
  UPGRADE: 'Upgrade',
  ANNOUNCEMENT: 'Announcement',
  METRICS: 'Metrics',
  SECURITY: 'Security',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // ── Homepage OG image (no id) ──
    if (!id) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#08080c',
              fontFamily: 'monospace',
              padding: '48px 56px',
            }}
          >
            {/* Subtle grid dots */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.04,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Category pills row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '48px' }}>
              {(['Research', 'EIP/ERC', 'Governance', 'Security', 'Metrics', 'Upgrade'] as const).map((label, i) => {
                const colors = [
                  { bg: 'rgba(99,102,241,0.12)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
                  { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
                  { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
                  { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
                  { bg: 'rgba(251,146,60,0.12)', text: '#fb923c', border: 'rgba(251,146,60,0.3)' },
                  { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
                ][i];
                return (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: colors.text,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Logo */}
            <div
              style={{
                display: 'flex',
                fontSize: '56px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#e8e8ec',
                marginBottom: '20px',
              }}
            >
              <span style={{ color: '#3b82f6' }}>[</span>
              Hexcast
              <span style={{ color: '#3b82f6' }}>]</span>
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: '20px',
                letterSpacing: '0.08em',
                color: '#6a6a7a',
                marginBottom: '48px',
              }}
            >
              Ethereum ecosystem intelligence
            </div>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '60%',
              }}
            >
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#4a4a5a',
                }}
              >
                88 curated sources
              </span>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>
        ),
        { width: 1200, height: 630 },
      );
    }

    // ── Card-specific OG image ──
    const card = await getCardById(id);
    if (!card) {
      return new Response('Card not found', { status: 404 });
    }

    const categoryLabel = CATEGORY_LABELS[card.category] ?? card.category;
    const colors = CATEGORY_COLORS[card.category] ?? CATEGORY_COLORS.RESEARCH;
    const summary = card.summary.length > 180 ? card.summary.slice(0, 180) + '...' : card.summary;

    let domain = '';
    try {
      domain = new URL(card.canonical_url).hostname.replace('www.', '');
    } catch {
      domain = '';
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#08080c',
            fontFamily: 'monospace',
            padding: '48px 56px',
          }}
        >
          {/* Top bar: category + source */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                padding: '6px 14px',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: colors.text,
                background: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              {categoryLabel}
            </div>
            <span
              style={{
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#4a4a5a',
              }}
            >
              {domain}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '36px',
            }}
          >
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                color: '#4a4a5a',
              }}
            >
              intel
            </span>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Headline */}
          <div
            style={{
              marginTop: '28px',
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase' as const,
              color: '#e8e8ec',
            }}
          >
            {card.headline}
          </div>

          {/* Summary */}
          <div
            style={{
              marginTop: '20px',
              fontSize: '17px',
              lineHeight: 1.7,
              fontWeight: 400,
              color: '#8a8a9a',
            }}
          >
            {summary}
          </div>

          {/* Bottom: branding */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: '#e8e8ec',
              }}
            >
              <span style={{ color: '#3b82f6' }}>[</span>
              Hexcast
              <span style={{ color: '#3b82f6' }}>]</span>
            </div>
            <span
              style={{
                fontSize: '13px',
                letterSpacing: '0.08em',
                color: '#4a4a5a',
              }}
            >
              Ethereum ecosystem intelligence
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate image', { status: 500 });
  }
}
