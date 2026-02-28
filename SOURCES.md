<div align="center">

# `[ hexcast ]` · Source Registry

**The complete record of every source Hexcast monitors.**

[![Sources](https://img.shields.io/badge/active%20sources-69-22c55e?style=flat-square)]()
[![Tiers](https://img.shields.io/badge/tiers-14-3b82f6?style=flat-square)]()
[![Categories](https://img.shields.io/badge/categories-8-3b82f6?style=flat-square)]()
[![Updated](https://img.shields.io/badge/updated-February%202026-8a8a9a?style=flat-square)]()

<br/>

> What it is, how it's fetched, on what schedule.<br/>
> What was removed — and why.

<br/>

**[→ hexcast.xyz](https://hexcast.xyz)** &nbsp;·&nbsp; [README](./README.md) &nbsp;·&nbsp; [Source Rankings](./SOURCE_RANKINGS.md)

</div>

---

## Active Sources

### Tier 1 — Core Protocol

The primary record of Ethereum protocol development. Every source here is a canonical, authoritative origin — not a derivative.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Ethereum Research | `ethresear.ch` | Discourse API | RESEARCH | 2h |
| Fellowship of Ethereum Magicians | `ethereum-magicians.org` | Discourse API | EIP_ERC | 2h |
| Ethereum EIPs | `github.com/ethereum/EIPs` | GitHub API | EIP_ERC | 4h |
| Ethereum ERCs | `github.com/ethereum/ERCs` | GitHub API | EIP_ERC | 4h |
| All Core Devs PM | `github.com/ethereum/pm` | GitHub API | PROTOCOL_CALLS | 4h |
| Forkcast — ACD Call Archive | `forkcast.org` | HTML scraper | PROTOCOL_CALLS | 2h |
| Ethereum Foundation Blog | `blog.ethereum.org` | RSS | ANNOUNCEMENT | 2h |
| Vitalik Buterin's Blog | `vitalik.eth.limo` | RSS | RESEARCH | 2h |

---

### Tier 2 — Community Intelligence

Trusted community sources that distill and contextualize protocol activity.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Ethereum Cat Herders | `medium.com/ethereum-cat-herders` | RSS | PROTOCOL_CALLS | 2h |
| Christine Kim — ACDC Notes | `christinedkim.substack.com` | RSS | PROTOCOL_CALLS | 2h |
| Ethereum Weekly Digest | `ethereumweeklydigest.substack.com` | RSS | ANNOUNCEMENT | 2h |

---

### Tier 3 — L2 Governance (Major)

The five largest L2 governance forums by TVL and governance activity.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Optimism Collective | `gov.optimism.io` | Discourse API | GOVERNANCE | 2h |
| Arbitrum DAO | `forum.arbitrum.foundation` | Discourse API | GOVERNANCE | 2h |
| ZK Nation (zkSync) | `forum.zknation.io` | Discourse API | GOVERNANCE | 2h |
| Starknet Community | `community.starknet.io` | Discourse API | GOVERNANCE | 2h |
| Uniswap Governance | `gov.uniswap.org` | Discourse API | GOVERNANCE | 2h |

---

### Tier 5 — Ethereum Client Releases

All 5 execution layer and 5 consensus layer clients. Client release feeds poll every 30 minutes — the shortest interval in the pipeline — because mandatory upgrades are time-critical.

| Source | ID | Layer | Fetcher | Poll |
|---|---|---|---|---|
| Geth | `github.com/ethereum/go-ethereum` | Execution | RSS (GitHub releases) | 30m |
| Nethermind | `github.com/NethermindEth/nethermind` | Execution | RSS | 30m |
| Besu | `github.com/hyperledger/besu` | Execution | RSS | 30m |
| Reth | `github.com/paradigmxyz/reth` | Execution | RSS | 30m |
| Erigon | `github.com/erigontech/erigon` | Execution | RSS | 30m |
| Lighthouse | `github.com/sigp/lighthouse` | Consensus | RSS | 30m |
| Prysm | `github.com/OffchainLabs/prysm` | Consensus | RSS | 30m |
| Teku | `github.com/ConsenSys/teku` | Consensus | RSS | 30m |
| Nimbus | `github.com/status-im/nimbus-eth2` | Consensus | RSS | 30m |
| Lodestar | `github.com/ChainSafe/lodestar` | Consensus | RSS | 30m |

---

### Tier 6 — On-Chain Metrics

DefiLlama's open REST API. No API key required. Industry-standard DeFi data.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| DefiLlama — Chain TVL | `defillama.com/chains` | REST API | METRICS | 1h |
| DefiLlama — Stablecoin Metrics | `defillama.com/stablecoins` | REST API | METRICS | 1h |
| DefiLlama — DEX Volume | `defillama.com/dexs` | REST API | METRICS | 1h |

---

### Tier 7 — Crypto Social / Trending

Aggregator sources. Lower baseline signal density than all other tiers. The quality scorer applies stricter suppression to content originating here.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| CryptoPanic — Trending | `cryptopanic.com/trending` | CryptoPanic API | ANNOUNCEMENT | 30m |
| CryptoPanic — Hot | `cryptopanic.com/hot` | CryptoPanic API | ANNOUNCEMENT | 30m |
| CryptoPanic — Rising | `cryptopanic.com/rising` | CryptoPanic API | ANNOUNCEMENT | 30m |
| Crypto News | `cryptocurrency.cv/news` | Crypto News API | ANNOUNCEMENT | 1h |

---

### Tier 8 — DeFi Protocol Governance

Major DeFi protocol governance forums. All use the standard Discourse API.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Aave Governance | `governance.aave.com` | Discourse API | GOVERNANCE | 2h |
| Lido Research Forum | `research.lido.fi` | Discourse API | GOVERNANCE | 2h |
| Sky (MakerDAO) Forum | `forum.sky.money` | Discourse API | GOVERNANCE | 2h |
| Compound Forum | `comp.xyz` | Discourse API | GOVERNANCE | 2h |
| Curve Governance | `gov.curve.finance` | Discourse API | GOVERNANCE | 2h |
| ENS DAO | `discuss.ens.domains` | Discourse API | GOVERNANCE | 2h |
| EigenLayer Forum | `forum.eigenlayer.xyz` | Discourse API | GOVERNANCE | 2h |
| The Graph Forum | `forum.thegraph.com` | Discourse API | GOVERNANCE | 2h |
| Safe Forum | `forum.safe.global` | Discourse API | GOVERNANCE | 2h |

---

### Tier 9 — L2 Governance (Extended)

Smaller L2 governance forums. Lower TVL and activity than Tier 3, but canonical sources for their ecosystems.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Scroll Governance | `forum.scroll.io` | Discourse API | GOVERNANCE | 2h |
| Polygon Community | `forum.polygon.technology` | Discourse API | GOVERNANCE | 2h |
| Linea Community | `community.linea.build` | Discourse API | GOVERNANCE | 2h |
| Taiko Community | `community.taiko.xyz` | Discourse API | GOVERNANCE | 2h |

---

### Tier 10 — MEV / PBS

Flashbots runs the infrastructure that builds ~90% of Ethereum blocks. These sources track MEV research and relay development.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Flashbots Collective Forum | `collective.flashbots.net` | Discourse API | RESEARCH | 2h |
| Flashbots PM | `github.com/flashbots/pm` | GitHub API | RESEARCH | 4h |
| MEV-Boost Relay | `github.com/flashbots/mev-boost-relay` | GitHub API | UPGRADE | 4h |

---

### Tier 11 — Standards & Developer Tooling

Canonical repositories for L2 standards, account abstraction, and developer tooling.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Rollup Improvement Proposals | `github.com/ethereum/RIPs` | GitHub API | EIP_ERC | 4h |
| ERC-4337 Account Abstraction | `github.com/eth-infinitism/account-abstraction` | GitHub API | EIP_ERC | 4h |
| Foundry Releases | `github.com/foundry-rs/foundry` | RSS | UPGRADE | 30m |

---

### Tier 12 — Research & Security Blogs

High-signal individual researchers and security firms. Low publish frequency, high impact per post.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Jon Charbonneau | `joncharbonneau.substack.com` | RSS | RESEARCH | 2h |
| Trail of Bits Blog | `blog.trailofbits.com` | RSS | SECURITY | 2h |
| OpenZeppelin — Security & Research | `www.openzeppelin.com` | RSS | SECURITY | 2h |
| Nethermind Blog | `www.nethermind.io` | Nethermind scraper | RESEARCH | 2h |

---

### Tier 13 — Protocol & Ecosystem Blogs

Additional protocol team and ecosystem blogs. Higher volume, more variable signal density.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Sigma Prime Blog | `blog.sigmaprime.io` | RSS | SECURITY | 2h |
| Lido Finance Blog | `blog.lido.fi` | RSS | ANNOUNCEMENT | 2h |
| Immunefi — Bug Bounty Reports | `medium.com/immunefi` | RSS | SECURITY | 2h |
| Offchain Labs (Arbitrum) Blog | `offchain.medium.com` | RSS | ANNOUNCEMENT | 2h |
| Chainlink Blog | `blog.chain.link` | RSS | ANNOUNCEMENT | 2h |
| The Block | `www.theblock.co` | RSS | ANNOUNCEMENT | 1h |

---

### Tier 14 — Smart Contract Language Releases

Compiler releases for Solidity and Vyper. 30-minute poll — same urgency tier as client releases.

| Source | ID | Fetcher | Category | Poll |
|---|---|---|---|---|
| Solidity Compiler | `github.com/ethereum/solidity` | RSS | UPGRADE | 30m |
| Vyper Compiler | `github.com/vyperlang/vyper` | RSS | UPGRADE | 30m |

---

### P1 — High-Signal Sources

Elevated to P1 on content quality alone — each is either the only source for its type of content or publishes landmark-level material. Fetcher type varies: some require custom scrapers due to no RSS, others have RSS but warrant P1 treatment regardless.

| Source | ID | Fetcher | Category | Poll | Why custom |
|---|---|---|---|---|---|
| Rekt News | `rekt.news` | `RektNewsFetcher` | SECURITY | 2h | No RSS. HTML scraper for `article.post` elements. |
| Paradigm Research | `paradigm.xyz` | `ParadigmFetcher` | RESEARCH | 2h | No RSS. Extracts from Next.js `__NEXT_DATA__` script tag. |
| Flashbots Writings | `writings.flashbots.net` | RSS | RESEARCH | 2h | Has RSS at `/rss.xml`. |
| samczsun | `samczsun.com` | RSS | SECURITY | 2h | Has RSS at `/rss/`. |
| Tim Beiko — ACD Updates | `hackmd.io/@timbeiko/acd` | `HackMdFetcher` | PROTOCOL_CALLS | 4h | Scrapes HackMD index page for ACD update document links. |

---

## Fetcher Types

| Type | How it works | Sources using it |
|---|---|---|
| `discourse` | Polls `/latest.json` and `/latest.rss` | 21 governance and research forums |
| `github_api` | GitHub REST API for releases, issues, PRs | 7 repositories |
| `rss` | Standard RSS/Atom feed parsing | 29 blogs, newsletters, and GitHub release feeds |
| `html_scraper` | Custom HTML scraper (`HtmlScraperFetcher`) | forkcast.org |
| `rest_api` | Custom REST API client | 3 DefiLlama endpoints |
| `cryptopanic` | CryptoPanic developer API | 3 trending feeds |
| `crypto_news_api` | cryptocurrency.cv REST API | 1 news feed |
| `rekt_scraper` | Custom HTML scraper (cheerio) | rekt.news |
| `paradigm_scraper` | Next.js `__NEXT_DATA__` extraction | paradigm.xyz |
| `nethermind_scraper` | Custom scraper for Nethermind blog | www.nethermind.io |
| `hackmd_scraper` | HackMD index page scraper | Tim Beiko ACD notes |

---

## Removed Sources

Sources removed from the pipeline, with the reason and date.

| Source | ID | Removed | Reason |
|---|---|---|---|
| Week in Ethereum News | `weekinethereum.substack.com` | Feb 2026 | **Discontinued.** Evan Van Ness retired the newsletter in January 2025. Final issue published. Source is permanently dead — no new content will ever appear. Deactivated in database, removed from sources.ts. |

### Sources Evaluated and Rejected (Never Integrated)

| Source | Reason not added |
|---|---|
| The Daily Gwei | Discontinued August 2022. Final episode #532. Dead source. |
| Polynya | Blog concluded by author. All content CC0 archived. No new posts. |
| Chainlink Community Forum | `community.chain.link` returns NXDOMAIN — DNS removed. Community moved to Discord/Reddit. |
| Delphi Digital | Paywalled. Cannot integrate paid research content. |
| Messari (full) | Mostly paywalled. Only free data endpoints considered. |

---

## Source Counts by Category

| Pipeline category | Active sources |
|---|---|
| RESEARCH | 8 |
| EIP_ERC | 5 |
| PROTOCOL_CALLS | 5 |
| GOVERNANCE | 18 |
| UPGRADE | 14 |
| SECURITY | 6 |
| ANNOUNCEMENT | 10 |
| METRICS | 3 |
| **Total** | **69** |

---

## Quality Thresholds by Tier

The quality scorer applies per-source weights. Items below the suppress threshold never reach the feed. Weights are defined in `pipeline/src/processors/quality-scorer.ts`.

| Tier | Source weight range | Notes |
|---|---|---|
| Tier 1 | 0.95–1.00 | `forkcast.org` = 0.95; all others = 1.00 |
| Tier 2 | 0.85–0.90 | `ethereumweeklydigest` = 0.85; rest = 0.90 |
| Tier 3 | 0.75–0.80 | Optimism/Arbitrum/Uniswap = 0.80; zkSync/Starknet = 0.75 |
| Tier 5 | 0.90 | All 10 client release feeds |
| Tier 6 | 0.70 | All 3 DefiLlama endpoints |
| Tier 7 | 0.30–0.40 | Rising = 0.30; Trending/crypto.cv = 0.35; Hot = 0.40 |
| Tier 8 | 0.70–0.80 | Aave/Lido/ENS = 0.80; most others = 0.75; Graph/Safe = 0.70 |
| Tier 9 | 0.70–0.75 | Polygon = 0.75; Scroll/Linea/Taiko = 0.70 |
| Tier 10 | 0.85 | All 3 Flashbots sources |
| Tier 11 | 0.85–0.90 | RIPs = 0.90; Account Abstraction/Foundry = 0.85 |
| Tier 12 | 0.85–0.95 | Trail of Bits = 0.95; Jon Charbonneau/OpenZeppelin = 0.90; Nethermind = 0.85 |
| Tier 13 | 0.50 | Not in weight map — falls back to `DEFAULT_SOURCE_WEIGHT` |
| Tier 14 | 0.50 | Not in weight map — falls back to `DEFAULT_SOURCE_WEIGHT` |
| P1 | 0.90–0.95 | rekt.news/Paradigm/samczsun = 0.95; Flashbots Writings/Tim Beiko = 0.90 |
| **Suppress threshold** | **< 0.25** | Global — applies to all tiers |

---

<div align="center">

`[ hexcast ]` &nbsp;·&nbsp; source registry &nbsp;·&nbsp; February 2026

**[hexcast.xyz →](https://hexcast.xyz)**

</div>
