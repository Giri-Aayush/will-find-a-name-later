import type { Category } from '@hexcast/shared';

const SOURCE_CATEGORY_MAP: Record<string, Category> = {
  // Tier 1 — Core Protocol
  'ethresear.ch': 'RESEARCH',
  'ethereum-magicians.org': 'EIP_ERC',
  'github.com/ethereum/EIPs': 'EIP_ERC',
  'github.com/ethereum/ERCs': 'EIP_ERC',
  'github.com/ethereum/pm': 'PROTOCOL_CALLS',
  'forkcast.org': 'PROTOCOL_CALLS',
  'blog.ethereum.org': 'ANNOUNCEMENT',
  'vitalik.eth.limo': 'RESEARCH',

  // Tier 2 — Community Intelligence
  'medium.com/ethereum-cat-herders': 'PROTOCOL_CALLS',
  'christinedkim.substack.com': 'PROTOCOL_CALLS',
  'ethereumweeklydigest.substack.com': 'ANNOUNCEMENT',

  // Tier 3 — L2 Governance
  'gov.optimism.io': 'GOVERNANCE',
  'forum.arbitrum.foundation': 'GOVERNANCE',
  'forum.zknation.io': 'GOVERNANCE',
  'community.starknet.io': 'GOVERNANCE',
  'gov.uniswap.org': 'GOVERNANCE',

  // Tier 5 — Client Releases (Execution Layer)
  'github.com/ethereum/go-ethereum': 'UPGRADE',
  'github.com/NethermindEth/nethermind': 'UPGRADE',
  'github.com/hyperledger/besu': 'UPGRADE',
  'github.com/paradigmxyz/reth': 'UPGRADE',
  'github.com/erigontech/erigon': 'UPGRADE',
  // Tier 5 — Client Releases (Consensus Layer)
  'github.com/sigp/lighthouse': 'UPGRADE',
  'github.com/OffchainLabs/prysm': 'UPGRADE',
  'github.com/ConsenSys/teku': 'UPGRADE',
  'github.com/status-im/nimbus-eth2': 'UPGRADE',
  'github.com/ChainSafe/lodestar': 'UPGRADE',

  // Tier 6 — On-Chain Metrics
  'defillama.com/stablecoins': 'METRICS',
  'defillama.com/chains': 'METRICS',
  'defillama.com/dexs': 'METRICS',

  // Tier 7 — Crypto Social / Trending
  'cryptopanic.com/trending': 'ANNOUNCEMENT',
  'cryptopanic.com/hot': 'ANNOUNCEMENT',
  'cryptopanic.com/rising': 'ANNOUNCEMENT',
  'cryptocurrency.cv/news': 'ANNOUNCEMENT',

  // Tier 8 — DeFi Protocol Governance
  'research.lido.fi': 'GOVERNANCE',
  'comp.xyz': 'GOVERNANCE',
  'gov.curve.finance': 'GOVERNANCE',
  'discuss.ens.domains': 'GOVERNANCE',
  'forum.eigenlayer.xyz': 'GOVERNANCE',
  'forum.thegraph.com': 'GOVERNANCE',
  'forum.safe.global': 'GOVERNANCE',
  'governance.aave.com': 'GOVERNANCE',
  'forum.sky.money': 'GOVERNANCE',

  // Tier 9 — Additional L2 Governance
  'forum.scroll.io': 'GOVERNANCE',
  'forum.polygon.technology': 'GOVERNANCE',
  'community.linea.build': 'GOVERNANCE',
  'community.taiko.xyz': 'GOVERNANCE',

  // Tier 10 — MEV / PBS
  'collective.flashbots.net': 'RESEARCH',
  'github.com/flashbots/pm': 'RESEARCH',
  'github.com/flashbots/mev-boost-relay': 'UPGRADE',

  // Tier 11 — Standards & Developer Tooling
  'github.com/ethereum/RIPs': 'EIP_ERC',
  'github.com/eth-infinitism/account-abstraction': 'EIP_ERC',
  'github.com/foundry-rs/foundry': 'UPGRADE',

  // Tier 12 — Research & Security Blogs
  'joncharbonneau.substack.com': 'RESEARCH',
  'blog.trailofbits.com': 'SECURITY',
  'www.openzeppelin.com': 'SECURITY',
  'www.nethermind.io': 'RESEARCH',

  // P1 — High-Signal Sources
  'rekt.news': 'SECURITY',
  'paradigm.xyz': 'RESEARCH',
  'writings.flashbots.net': 'RESEARCH',
  'samczsun.com': 'SECURITY',
  'hackmd.io/@timbeiko/acd': 'PROTOCOL_CALLS',
};

export function classify(sourceId: string): Category {
  return SOURCE_CATEGORY_MAP[sourceId] ?? 'ANNOUNCEMENT';
}
