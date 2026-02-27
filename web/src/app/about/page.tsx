export default function AboutPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">About EthPulse</h1>

      <p className="text-sm text-gray-300 leading-relaxed">
        EthPulse aggregates, curates, and summarises information from across the
        Ethereum ecosystem and delivers it as a feed of 60-word story cards. Each
        card captures one event, proposal, decision, or development — enough context
        to understand what happened and why it matters.
      </p>

      <section>
        <h2 className="text-lg font-semibold mb-2">Data Sources</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          30 sources across 6 tiers: core protocol research (ethresear.ch, Ethereum Magicians),
          EIP/ERC registries, All Core Devs project management, governance forums
          (Optimism, Arbitrum, zkSync, Starknet, Uniswap), 10 Ethereum client release
          feeds, community newsletters, and DefiLlama on-chain metrics.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">How It Works</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          A data pipeline polls sources on schedules ranging from 30 minutes to 4 hours.
          New items are normalised, deduplicated, classified into 8 categories, and
          summarised by an AI model into exactly 60 words. The resulting cards appear
          in your feed within hours of the original publication.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Open Source</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Built with Next.js, Supabase, and TypeScript. MIT License.
        </p>
        <a
          href="https://github.com/Giri-Aayush/will-find-a-name-later"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          View on GitHub &rarr;
        </a>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Report an Issue</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          See an inaccurate card? Tap the Flag button on any card to submit a report.
          Flagged cards are reviewed within 24 hours.
        </p>
      </section>
    </main>
  );
}
