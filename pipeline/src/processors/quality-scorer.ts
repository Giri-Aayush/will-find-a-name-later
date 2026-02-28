import type { EngagementMetrics } from '@ethpulse/shared';

/**
 * Source quality weights based on tier and signal reliability.
 * Range: 0.0 (low-trust aggregator) → 1.0 (primary protocol source).
 */
const SOURCE_QUALITY_WEIGHTS: Record<string, number> = {
  // Tier 1 — Core Protocol (primary sources, highest trust)
  'ethresear.ch': 1.0,
  'ethereum-magicians.org': 1.0,
  'github.com/ethereum/EIPs': 1.0,
  'github.com/ethereum/ERCs': 1.0,
  'github.com/ethereum/pm': 1.0,
  'forkcast.org': 0.95,
  'blog.ethereum.org': 1.0,
  'vitalik.eth.limo': 1.0,

  // Tier 2 — Community Intelligence
  'medium.com/ethereum-cat-herders': 0.9,
  'christinedkim.substack.com': 0.9,
  'ethereumweeklydigest.substack.com': 0.85,

  // Tier 3 — L2 Governance
  'gov.optimism.io': 0.8,
  'forum.arbitrum.foundation': 0.8,
  'forum.zknation.io': 0.75,
  'community.starknet.io': 0.75,
  'gov.uniswap.org': 0.8,

  // Tier 5 — Client Releases (official release notes)
  'github.com/ethereum/go-ethereum': 0.9,
  'github.com/NethermindEth/nethermind': 0.9,
  'github.com/hyperledger/besu': 0.9,
  'github.com/paradigmxyz/reth': 0.9,
  'github.com/erigontech/erigon': 0.9,
  'github.com/sigp/lighthouse': 0.9,
  'github.com/OffchainLabs/prysm': 0.9,
  'github.com/ConsenSys/teku': 0.9,
  'github.com/status-im/nimbus-eth2': 0.9,
  'github.com/ChainSafe/lodestar': 0.9,

  // Tier 6 — On-Chain Metrics
  'defillama.com/stablecoins': 0.7,
  'defillama.com/chains': 0.7,
  'defillama.com/dexs': 0.7,

  // Tier 7 — Crypto Social / Aggregators (needs quality filtering)
  'cryptopanic.com/trending': 0.35,
  'cryptopanic.com/hot': 0.4,
  'cryptopanic.com/rising': 0.3,
  'cryptocurrency.cv/news': 0.35,

  // Tier 8 — DeFi Protocol Governance
  'research.lido.fi': 0.8,
  'comp.xyz': 0.75,
  'gov.curve.finance': 0.75,
  'discuss.ens.domains': 0.8,
  'forum.eigenlayer.xyz': 0.75,
  'forum.thegraph.com': 0.7,
  'forum.safe.global': 0.7,
  'governance.aave.com': 0.8,
  'forum.sky.money': 0.75,

  // Tier 9 — L2 Governance
  'forum.scroll.io': 0.7,
  'forum.polygon.technology': 0.75,
  'community.linea.build': 0.7,
  'community.taiko.xyz': 0.7,

  // Tier 10 — MEV / PBS
  'collective.flashbots.net': 0.85,
  'github.com/flashbots/pm': 0.85,
  'github.com/flashbots/mev-boost-relay': 0.85,

  // Tier 11 — Standards & Tooling
  'github.com/ethereum/RIPs': 0.9,
  'github.com/eth-infinitism/account-abstraction': 0.85,
  'github.com/foundry-rs/foundry': 0.85,

  // Tier 12 — Research & Security Blogs
  'joncharbonneau.substack.com': 0.9,
  'blog.trailofbits.com': 0.95,
  'blog.openzeppelin.com': 0.9,
  'nethermind.io/blog': 0.85,

  // P1 — High-Signal Sources
  'rekt.news': 0.95,
  'paradigm.xyz': 0.95,
  'writings.flashbots.net': 0.9,
  'samczsun.com': 0.95,
  'hackmd.io/@timbeiko/acd': 0.9,
};

const DEFAULT_SOURCE_WEIGHT = 0.5;
const AUTO_SUPPRESS_THRESHOLD = 0.25;

interface QualityInput {
  sourceId: string;
  headline: string;
  summary: string;
  author: string | null;
  engagement: EngagementMetrics | null;
}

/**
 * Compute a quality score (0.0 – 1.0) for a card.
 *
 * Formula: sourceWeight * 0.4 + contentSignals * 0.6
 *
 * Content signals (0.0 – 1.0):
 *   - Headline exists and is substantial (> 10 chars): 0.35
 *   - Summary exists and is substantial (> 40 chars):  0.40
 *   - Author attribution present:                      0.15
 *   - Engagement data present:                         0.10
 */
export function scoreQuality(input: QualityInput): number {
  const sourceWeight = SOURCE_QUALITY_WEIGHTS[input.sourceId] ?? DEFAULT_SOURCE_WEIGHT;

  let contentSignals = 0;

  // Headline quality
  if (input.headline && input.headline.length > 10) {
    contentSignals += 0.35;
  } else if (input.headline && input.headline.length > 0) {
    contentSignals += 0.15;
  }

  // Summary quality
  if (input.summary && input.summary.length > 40) {
    contentSignals += 0.40;
  } else if (input.summary && input.summary.length > 0) {
    contentSignals += 0.15;
  }

  // Author attribution
  if (input.author) {
    contentSignals += 0.15;
  }

  // Engagement data
  if (input.engagement && (input.engagement.likes || input.engagement.replies || input.engagement.views)) {
    contentSignals += 0.10;
  }

  return sourceWeight * 0.4 + contentSignals * 0.6;
}

/**
 * Should this card be auto-suppressed due to low quality?
 * Cards below the threshold get is_suspended = true.
 */
export function shouldAutoSuppress(score: number): boolean {
  return score < AUTO_SUPPRESS_THRESHOLD;
}
