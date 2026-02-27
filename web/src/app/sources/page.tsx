import { getSources } from '@/lib/queries';
import { SourceList } from '@/components/source-list';

export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const sources = await getSources();
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Sources</h1>
      <p className="text-sm text-gray-400 mb-4">
        {sources.length} active sources. Toggle visibility to customize your feed.
      </p>
      <SourceList sources={sources} />
    </main>
  );
}
