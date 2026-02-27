export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <h1
        className="text-4xl mb-3"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        404
      </h1>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Page not found.
      </p>
    </main>
  );
}
