import type { Category } from '@ethpulse/shared';

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
  'weekinethereum.substack.com': 'ANNOUNCEMENT',
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
};

export function classify(sourceId: string): Category {
  return SOURCE_CATEGORY_MAP[sourceId] ?? 'ANNOUNCEMENT';
}
