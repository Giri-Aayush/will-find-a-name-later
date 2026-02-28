'use client';

export const dynamic = 'force-static';

export default function OfflinePage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06060a',
        fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
        color: '#ededf0',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.03,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          marginBottom: '2.5rem',
        }}
      >
        <span style={{ color: '#3b82f6', textShadow: '0 0 10px rgba(59,130,246,0.25)' }}>[</span>
        EthPulse
        <span style={{ color: '#3b82f6', textShadow: '0 0 10px rgba(59,130,246,0.25)' }}>]</span>
      </div>

      {/* Signal icon (ASCII art) */}
      <div
        style={{
          fontSize: '11px',
          lineHeight: 1.6,
          color: '#484858',
          marginBottom: '2rem',
          fontWeight: 400,
        }}
      >
        <div>{'    ╱╲    '}</div>
        <div>{'   ╱  ╲   '}</div>
        <div>{'  ╱ ── ╲  '}</div>
        <div>{'      ×    '}</div>
      </div>

      {/* Status */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          color: '#ef4444',
          textShadow: '0 0 10px rgba(239,68,68,0.25)',
          marginBottom: '0.75rem',
        }}
      >
        [offline]
      </div>

      <div
        style={{
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: '#8a8a9a',
          maxWidth: '280px',
          lineHeight: 1.8,
        }}
      >
        no network connection detected.
        <br />
        reconnect to resume your intel feed.
      </div>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '2.5rem',
          width: '200px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))',
          }}
        />
        <span style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#484858' }}>
          STANDBY
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)',
          }}
        />
      </div>

      {/* Retry button */}
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '2rem',
          padding: '10px 24px',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          color: '#3b82f6',
          background: 'transparent',
          border: '1px solid #3b82f6',
          fontFamily: "'IBM Plex Mono', monospace",
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        [retry connection]
      </button>
    </div>
  );
}
