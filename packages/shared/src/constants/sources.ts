import type { Category } from './categories.js';

export interface SourceDefinition {
  id: string;
  display_name: string;
  base_url: string;
  api_type: 'discourse' | 'github_api' | 'rss' | 'graphql' | 'html_scraper' | 'rest_api' | 'cryptopanic' | 'crypto_news_api';
  poll_interval_s: number;
  default_category: Category;
}

// ── Tier 1: Core Protocol Sources ──────────────────────────────────────

export const TIER_1_SOURCES: SourceDefinition[] = [
  {
    id: 'ethresear.ch',
    display_name: 'Ethereum Research',
    base_url: 'https://ethresear.ch',
    api_type: 'discourse',
    poll_interval_s: 7200,
    default_category: 'RESEARCH',
  },
  {
    id: 'ethereum-magicians.org',
    display_name: 'Fellowship of Ethereum Magicians',
    base_url: 'https://ethereum-magicians.org',
    api_type: 'discourse',
    poll_interval_s: 7200,
    default_category: 'EIP_ERC',
  },
  {
    id: 'github.com/ethereum/EIPs',
    display_name: 'Ethereum Improvement Proposals',
    base_url: 'https://github.com/ethereum/EIPs',
    api_type: 'github_api',
    poll_interval_s: 14400,
    default_category: 'EIP_ERC',
  },
  {
    id: 'github.com/ethereum/ERCs',
    display_name: 'Ethereum Request for Comments',
    base_url: 'https://github.com/ethereum/ERCs',
    api_type: 'github_api',
    poll_interval_s: 14400,
    default_category: 'EIP_ERC',
  },
  {
    id: 'github.com/ethereum/pm',
    display_name: 'All Core Devs Project Management',
    base_url: 'https://github.com/ethereum/pm',
    api_type: 'github_api',
    poll_interval_s: 14400,
    default_category: 'PROTOCOL_CALLS',
  },
  {
    id: 'forkcast.org',
    display_name: 'Forkcast - ACD Call Archive',
    base_url: 'https://forkcast.org',
    api_type: 'html_scraper',
    poll_interval_s: 7200,
    default_category: 'PROTOCOL_CALLS',
  },
  {
    id: 'blog.ethereum.org',
    display_name: 'Ethereum Foundation Blog',
    base_url: 'https://blog.ethereum.org',
    api_type: 'rss',
    poll_interval_s: 7200,
    default_category: 'ANNOUNCEMENT',
  },
  {
    id: 'vitalik.eth.limo',
    display_name: "Vitalik Buterin's Blog",
    base_url: 'https://vitalik.eth.limo',
    api_type: 'rss',
    poll_interval_s: 7200,
    default_category: 'RESEARCH',
  },
];

// ── Tier 2: Community Intelligence Sources (RSS) ───────────────────────

export const TIER_2_SOURCES: SourceDefinition[] = [
  {
    id: 'medium.com/ethereum-cat-herders',
    display_name: 'Ethereum Cat Herders',
    base_url: 'https://medium.com/ethereum-cat-herders',
    api_type: 'rss',
    poll_interval_s: 7200,
    default_category: 'PROTOCOL_CALLS',
  },
  {
    id: 'weekinethereum.substack.com',
    display_name: 'Week in Ethereum News',
    base_url: 'https://weekinethereum.substack.com',
    api_type: 'rss',
    poll_interval_s: 7200,
    default_category: 'ANNOUNCEMENT',
  },
  {
    id: 'christinedkim.substack.com',
    display_name: 'Christine Kim — ACDC Notes',
    base_url: 'https://christinedkim.substack.com',
    api_type: 'rss',
    poll_interval_s: 7200,
    default_category: 'PROTOCOL_CALLS',
  },
  {
    id: 'ethereumweeklydigest.substack.com',
    display_name: 'Ethereum Weekly Digest',
    base_url: 'https://ethereumweeklydigest.substack.com',
    api_type: 'rss',
    poll_interval_s: 7200,
    default_category: 'ANNOUNCEMENT',
  },
];

// ── Tier 3: Layer 2 Governance Sources (Discourse) ─────────────────────

export const TIER_3_SOURCES: SourceDefinition[] = [
  {
    id: 'gov.optimism.io',
    display_name: 'Optimism Collective Governance',
    base_url: 'https://gov.optimism.io',
    api_type: 'discourse',
    poll_interval_s: 7200,
    default_category: 'GOVERNANCE',
  },
  {
    id: 'forum.arbitrum.foundation',
    display_name: 'Arbitrum DAO Forum',
    base_url: 'https://forum.arbitrum.foundation',
    api_type: 'discourse',
    poll_interval_s: 7200,
    default_category: 'GOVERNANCE',
  },
  {
    id: 'forum.zknation.io',
    display_name: 'ZK Nation (zkSync) Forum',
    base_url: 'https://forum.zknation.io',
    api_type: 'discourse',
    poll_interval_s: 7200,
    default_category: 'GOVERNANCE',
  },
  {
    id: 'community.starknet.io',
    display_name: 'Starknet Community Forum',
    base_url: 'https://community.starknet.io',
    api_type: 'discourse',
    poll_interval_s: 7200,
    default_category: 'GOVERNANCE',
  },
  {
    id: 'gov.uniswap.org',
    display_name: 'Uniswap Governance Forum',
    base_url: 'https://gov.uniswap.org',
    api_type: 'discourse',
    poll_interval_s: 7200,
    default_category: 'GOVERNANCE',
  },
];

// ── Tier 5: Ethereum Client Release Feeds (Atom/RSS) ───────────────────

export const TIER_5_SOURCES: SourceDefinition[] = [
  {
    id: 'github.com/ethereum/go-ethereum',
    display_name: 'Geth (Execution Layer)',
    base_url: 'https://github.com/ethereum/go-ethereum',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/NethermindEth/nethermind',
    display_name: 'Nethermind (Execution Layer)',
    base_url: 'https://github.com/NethermindEth/nethermind',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/hyperledger/besu',
    display_name: 'Besu (Execution Layer)',
    base_url: 'https://github.com/hyperledger/besu',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/paradigmxyz/reth',
    display_name: 'Reth (Execution Layer)',
    base_url: 'https://github.com/paradigmxyz/reth',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/erigontech/erigon',
    display_name: 'Erigon (Execution Layer)',
    base_url: 'https://github.com/erigontech/erigon',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/sigp/lighthouse',
    display_name: 'Lighthouse (Consensus Layer)',
    base_url: 'https://github.com/sigp/lighthouse',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/OffchainLabs/prysm',
    display_name: 'Prysm (Consensus Layer)',
    base_url: 'https://github.com/OffchainLabs/prysm',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/ConsenSys/teku',
    display_name: 'Teku (Consensus Layer)',
    base_url: 'https://github.com/ConsenSys/teku',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/status-im/nimbus-eth2',
    display_name: 'Nimbus (Consensus Layer)',
    base_url: 'https://github.com/status-im/nimbus-eth2',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
  {
    id: 'github.com/ChainSafe/lodestar',
    display_name: 'Lodestar (Consensus Layer)',
    base_url: 'https://github.com/ChainSafe/lodestar',
    api_type: 'rss',
    poll_interval_s: 1800,
    default_category: 'UPGRADE',
  },
];

// ── Tier 6: On-Chain Metrics (DefiLlama REST API) ───────────────────

export const TIER_6_SOURCES: SourceDefinition[] = [
  {
    id: 'defillama.com/stablecoins',
    display_name: 'DefiLlama — Stablecoin Metrics',
    base_url: 'https://api.llama.fi',
    api_type: 'rest_api',
    poll_interval_s: 3600,
    default_category: 'METRICS',
  },
  {
    id: 'defillama.com/chains',
    display_name: 'DefiLlama — Chain TVL Tracker',
    base_url: 'https://api.llama.fi',
    api_type: 'rest_api',
    poll_interval_s: 3600,
    default_category: 'METRICS',
  },
  {
    id: 'defillama.com/dexs',
    display_name: 'DefiLlama — DEX Volume Tracker',
    base_url: 'https://api.llama.fi',
    api_type: 'rest_api',
    poll_interval_s: 3600,
    default_category: 'METRICS',
  },
];

// ── Tier 7: Crypto Social / Trending Sources ────────────────────────────

export const TIER_7_SOURCES: SourceDefinition[] = [
  {
    id: 'cryptopanic.com/trending',
    display_name: 'CryptoPanic — Trending',
    base_url: 'https://cryptopanic.com/api/developer/v2/posts/',
    api_type: 'cryptopanic',
    poll_interval_s: 1800,
    default_category: 'ANNOUNCEMENT',
  },
  {
    id: 'cryptopanic.com/hot',
    display_name: 'CryptoPanic — Hot',
    base_url: 'https://cryptopanic.com/api/developer/v2/posts/',
    api_type: 'cryptopanic',
    poll_interval_s: 1800,
    default_category: 'ANNOUNCEMENT',
  },
  {
    id: 'cryptopanic.com/rising',
    display_name: 'CryptoPanic — Rising',
    base_url: 'https://cryptopanic.com/api/developer/v2/posts/',
    api_type: 'cryptopanic',
    poll_interval_s: 1800,
    default_category: 'ANNOUNCEMENT',
  },
  {
    id: 'cryptocurrency.cv/news',
    display_name: 'Crypto News — Latest',
    base_url: 'https://cryptocurrency.cv/api/news',
    api_type: 'crypto_news_api',
    poll_interval_s: 3600,
    default_category: 'ANNOUNCEMENT',
  },
];

// ── All Sources ────────────────────────────────────────────────────────

export const ALL_SOURCES: SourceDefinition[] = [
  ...TIER_1_SOURCES,
  ...TIER_2_SOURCES,
  ...TIER_3_SOURCES,
  ...TIER_5_SOURCES,
  ...TIER_6_SOURCES,
  ...TIER_7_SOURCES,
];
