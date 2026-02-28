# Source Registry & Reliability Audit

> Last audited: February 28, 2026
> Total sources tracked: **61 implemented**, ~47 remaining candidates
> Audit method: URL verification, activity checks, RSS/API availability, editorial bias assessment
> Pipeline features: Quality scoring (auto-suppress < 0.25), category interleaving, personalized feed

---

## Table of Contents

1. [Audit Summary — Critical Actions](#1-audit-summary--critical-actions)
2. [Reliability Rating System](#2-reliability-rating-system)
3. [Implemented Sources (61) — Full Audit](#3-implemented-sources-61--full-audit)
4. [New Sources — Security & Audits](#4-new-sources--security--audits)
5. [New Sources — Research Blogs](#5-new-sources--research-blogs)
6. [New Sources — L2 Governance Forums](#6-new-sources--l2-governance-forums)
7. [New Sources — MEV / PBS](#7-new-sources--mev--pbs)
8. [New Sources — DeFi Protocol Governance](#8-new-sources--defi-protocol-governance)
9. [New Sources — Ecosystem Newsletters & Blogs](#9-new-sources--ecosystem-newsletters--blogs)
10. [New Sources — Data & Analytics](#10-new-sources--data--analytics)
11. [New Sources — Developer Tooling](#11-new-sources--developer-tooling)
12. [New Sources — Standards & Working Groups](#12-new-sources--standards--working-groups)
13. [Integration Feasibility by Type](#13-integration-feasibility-by-type)
14. [Priority Ranking — What to Add First](#14-priority-ranking--what-to-add-first)

---

## 1. Audit Summary — Critical Actions

### Sources to REMOVE (Dead/Discontinued)

| Source | Current ID | Problem | Action | Status |
|---|---|---|---|---|
| **Week in Ethereum News** | `weekinethereum.substack.com` | Discontinued January 2025. Author published farewell post. | REMOVE from sources.ts. | **DONE** — Removed and deactivated |
| **The Daily Gwei** | (not in codebase, was considered) | Discontinued ~August 2022. Last Substack post was #532. | Do NOT add. Dead source. | N/A |
| **Polynya** | (not in codebase, was considered) | Blog concluded by author. All content CC0 archived. | Do NOT add. Dead source. | N/A |

### Sources Needing URL Updates

| Source | Current URL | New URL | Reason |
|---|---|---|---|
| **OpenZeppelin Blog** | openzeppelin.com/blog | openzeppelin.com/news | Old URL returns 404. Rebranded to "News" section. |
| **EigenLayer Research** | research.eigenlayer.xyz | forum.eigenlayer.xyz/c/protocol-research/ | 301 redirect. Research subcategory moved to main forum. |
| **MakerDAO Forum** | forum.makerdao.com | forum.sky.money | MakerDAO rebranded to Sky in September 2024. 301 redirect. May have bot protection (403 on some requests). |

### Sources Verified as Healthy (Existing Codebase)

All 61 implemented sources in `sources.ts` are active and seeded to the database. No issues detected with:
- ethresear.ch, ethereum-magicians.org, ethereum/EIPs, ethereum/ERCs, ethereum/pm
- blog.ethereum.org, vitalik.eth.limo, forkcast.org
- Ethereum Cat Herders, Christine Kim, Ethereum Weekly Digest
- All 5 L2 governance forums (Optimism, Arbitrum, zkSync, Starknet, Uniswap)
- All 10 client release feeds (Geth, Nethermind, Besu, Reth, Erigon, Lighthouse, Prysm, Teku, Nimbus, Lodestar)
- All 3 DefiLlama endpoints
- All 4 CryptoPanic/Crypto News API feeds
- All 9 DeFi governance forums (Lido, Compound, Curve, ENS, EigenLayer, The Graph, Safe, Aave, Sky)
- All 4 additional L2 governance forums (Scroll, Polygon, Linea, Taiko)
- All 3 MEV/PBS sources (Flashbots Forum, PM, mev-boost-relay)
- All 3 standards/tooling sources (RIPs, ERC-4337, Foundry)
- All 4 research/security RSS sources (Jon Charbonneau, Trail of Bits, OpenZeppelin, Nethermind)
- All 5 P1 high-signal sources (Rekt News, Paradigm, Flashbots Writings, samczsun, Tim Beiko ACD)

---

## 2. Reliability Rating System

| Rating | Meaning | Criteria |
|---|---|---|
| **5/5 — Gold Standard** | Primary source of truth. Data originates here. | Official protocol repos, core team publications, on-chain data, first-party research |
| **4/5 — Highly Reliable** | Trusted secondary source. Accurate, well-maintained. | Established publications, curated aggregators, reputable firm blogs, active governance forums |
| **3/5 — Reliable with Caveats** | Good signal but requires awareness of bias or variable quality. | VC-backed research (investment bias), newer governance forums (low activity), crowdsourced platforms |
| **2/5 — Use with Caution** | Useful data but may have accuracy issues, spam, or bias. | Community forums with low moderation, aggregators mixing opinions with facts |
| **1/5 — Not Recommended** | Unreliable, stale, or unverifiable. | Dead blogs, unverified sources, heavy promotional content disguised as news |

---

## 3. Implemented Sources (61) — Full Audit

### Tier 1: Core Protocol (8 sources)

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Last Activity | RSS/API | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ethereum Research | `ethresear.ch` | ethresear.ch | Discourse | RESEARCH | **5/5** | ACTIVE | Feb 27, 2026 | `/latest.rss` + JSON API | Primary research forum. Zero editorial bias — raw researcher discussion. Gold standard. |
| 2 | Fellowship of Ethereum Magicians | `ethereum-magicians.org` | ethereum-magicians.org | Discourse | EIP_ERC | **5/5** | ACTIVE | Continuously | `/latest.rss` + JSON API | Where EIP/ERC debates happen before standardization. Essential for protocol tracking. |
| 3 | Ethereum Improvement Proposals | `github.com/ethereum/EIPs` | github.com/ethereum/EIPs | GitHub API | EIP_ERC | **5/5** | ACTIVE | Continuously | GitHub REST/GraphQL API | Canonical EIP repository. PRs and issues are the official process. |
| 4 | Ethereum Request for Comments | `github.com/ethereum/ERCs` | github.com/ethereum/ERCs | GitHub API | EIP_ERC | **5/5** | ACTIVE | Continuously | GitHub REST/GraphQL API | Application-layer standards (tokens, wallets, etc). Split from EIPs repo. |
| 5 | All Core Devs PM | `github.com/ethereum/pm` | github.com/ethereum/pm | GitHub API | PROTOCOL_CALLS | **5/5** | ACTIVE | Continuously | GitHub REST/GraphQL API | Agendas, notes, and recordings for ACD-E, ACD-C, and breakout calls. |
| 6 | Forkcast | `forkcast.org` | forkcast.org | HTML Scraper | PROTOCOL_CALLS | **5/5** | ACTIVE | Jan 2026 | Custom scraper (no RSS) | Open source (github.com/ethereum/forkcast). ACD call archive with structured summaries. |
| 7 | Ethereum Foundation Blog | `blog.ethereum.org` | blog.ethereum.org | RSS | ANNOUNCEMENT | **5/5** | ACTIVE | Continuously | RSS feed | Official EF communications. Upgrade announcements, roadmap updates, grant reports. |
| 8 | Vitalik Buterin's Blog | `vitalik.eth.limo` | vitalik.eth.limo | RSS | RESEARCH | **5/5** | ACTIVE | Continuously | RSS feed | Landmark posts that shape Ethereum's direction. Low frequency, highest impact per post. |

**Tier 1 Verdict**: All 8 sources are gold standard (5/5). No changes needed.

### Tier 2: Community Intelligence (3 sources)

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Last Activity | RSS/API | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 9 | Ethereum Cat Herders | `medium.com/ethereum-cat-herders` | medium.com/ethereum-cat-herders | RSS | PROTOCOL_CALLS | **4/5** | ACTIVE | Continuously | Medium RSS | Coordination body for Ethereum protocol process. EIPIP meetings, process improvements. Reliable. |
| ~~10~~ | ~~Week in Ethereum News~~ | ~~`weekinethereum.substack.com`~~ | — | — | — | **N/A** | **REMOVED** | — | — | **Removed Feb 2026.** Discontinued Jan 2025. Deactivated in DB. |
| 11 | Christine Kim — ACDC Notes | `christinedkim.substack.com` | christinedkim.substack.com | RSS | PROTOCOL_CALLS | **5/5** | ACTIVE | Jan 6, 2026 | Substack `/feed` + podcast | Galaxy Digital researcher. Most detailed ACD call notes available. Also has podcast. Essential. |
| 12 | Ethereum Weekly Digest | `ethereumweeklydigest.substack.com` | ethereumweeklydigest.substack.com | RSS | ANNOUNCEMENT | **4/5** | ACTIVE | Dec 14, 2025 | Substack `/feed` | Weekly roundup. Good replacement for Week in Ethereum. Moderate frequency. |

**Tier 2 Verdict**: weekinethereum removed. 3 healthy sources remain.

### Tier 3: L2 Governance (5 sources)

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | RSS/API | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 13 | Optimism Collective | `gov.optimism.io` | gov.optimism.io | Discourse | GOVERNANCE | **4/5** | ACTIVE | `/latest.rss` + JSON API | Largest L2 governance forum. Superchain, grants, retroPGF discussions. Very active. |
| 14 | Arbitrum DAO | `forum.arbitrum.foundation` | forum.arbitrum.foundation | Discourse | GOVERNANCE | **4/5** | ACTIVE | `/latest.rss` + JSON API | Active DAO with significant treasury. AIP proposals, grants, security council. |
| 15 | ZK Nation (zkSync) | `forum.zknation.io` | forum.zknation.io | Discourse | GOVERNANCE | **4/5** | ACTIVE | `/latest.rss` + JSON API | 53+ governance topics. ZIPs (zkSync Improvement Proposals). Growing activity. |
| 16 | Starknet Community | `community.starknet.io` | community.starknet.io | Discourse | GOVERNANCE | **4/5** | ACTIVE | `/latest.rss` + JSON API | 95+ governance topics. SIPs, STRK token governance, decentralization roadmap. |
| 17 | Uniswap Governance | `gov.uniswap.org` | gov.uniswap.org | Discourse | GOVERNANCE | **4/5** | ACTIVE | `/latest.rss` + JSON API | Fee switch debates, cross-chain deployments, grants. Very active as of Feb 2026. |

**Tier 3 Verdict**: All 5 sources are healthy (4/5). No changes needed.

### Tier 5: Client Releases (10 sources)

| # | Source | ID in codebase | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|
| 18 | Geth | `github.com/ethereum/go-ethereum` | RSS (GitHub releases) | UPGRADE | **5/5** | ACTIVE | Reference EL client. Most widely used. |
| 19 | Nethermind | `github.com/NethermindEth/nethermind` | RSS | UPGRADE | **5/5** | ACTIVE | .NET EL client. Growing market share. |
| 20 | Besu | `github.com/hyperledger/besu` | RSS | UPGRADE | **5/5** | ACTIVE | Java EL client. Enterprise focus. |
| 21 | Reth | `github.com/paradigmxyz/reth` | RSS | UPGRADE | **5/5** | ACTIVE | Rust EL client by Paradigm. Fastest growing. |
| 22 | Erigon | `github.com/erigontech/erigon` | RSS | UPGRADE | **5/5** | ACTIVE | Go EL client optimized for archive nodes. |
| 23 | Lighthouse | `github.com/sigp/lighthouse` | RSS | UPGRADE | **5/5** | ACTIVE | Rust CL client. |
| 24 | Prysm | `github.com/OffchainLabs/prysm` | RSS | UPGRADE | **5/5** | ACTIVE | Go CL client. Most widely used CL client. |
| 25 | Teku | `github.com/ConsenSys/teku` | RSS | UPGRADE | **5/5** | ACTIVE | Java CL client by ConsenSys. |
| 26 | Nimbus | `github.com/status-im/nimbus-eth2` | RSS | UPGRADE | **5/5** | ACTIVE | Nim CL client. Resource-efficient. |
| 27 | Lodestar | `github.com/ChainSafe/lodestar` | RSS | UPGRADE | **5/5** | ACTIVE | TypeScript CL client. Reference for JS devs. |

**Tier 5 Verdict**: All 10 sources are gold standard (5/5). GitHub releases are authoritative first-party data.

### Tier 6: On-Chain Metrics (3 sources)

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 28 | DefiLlama — Stablecoins | `defillama.com/stablecoins` | api.llama.fi | REST API | METRICS | **5/5** | ACTIVE | Open-source, no API key needed. Stablecoin supply data. |
| 29 | DefiLlama — Chain TVL | `defillama.com/chains` | api.llama.fi | REST API | METRICS | **5/5** | ACTIVE | TVL across all chains. Industry standard. |
| 30 | DefiLlama — DEX Volume | `defillama.com/dexs` | api.llama.fi | REST API | METRICS | **5/5** | ACTIVE | DEX trading volume. Comprehensive coverage. |

**Tier 6 Verdict**: All 3 sources are gold standard (5/5). DefiLlama is open-source and the industry standard for DeFi data.

### Tier 7: Crypto Social (4 sources)

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 31 | CryptoPanic — Trending | `cryptopanic.com/trending` | cryptopanic.com API | REST API | ANNOUNCEMENT | **3/5** | ACTIVE | Aggregator, not primary source. Useful for trending signal. Content quality varies. |
| 32 | CryptoPanic — Hot | `cryptopanic.com/hot` | cryptopanic.com API | REST API | ANNOUNCEMENT | **3/5** | ACTIVE | Same API, different filter. |
| 33 | CryptoPanic — Rising | `cryptopanic.com/rising` | cryptopanic.com API | REST API | ANNOUNCEMENT | **3/5** | ACTIVE | Same API, different filter. |
| 34 | Crypto News API | `cryptocurrency.cv/news` | cryptocurrency.cv API | REST API | ANNOUNCEMENT | **2/5** | ACTIVE | Generic aggregator. Lower signal quality. May include promotional content. |

**Tier 7 Notes**: These are aggregator sources (not primary). CryptoPanic is 3/5 because it aggregates from other sources, introducing a layer of indirection. Crypto News API is 2/5 — lowest quality in the pipeline. Quality scoring auto-suppresses low-quality items from these sources (score < 0.25).

### Tier 8: DeFi Protocol Governance (9 sources) — ADDED Feb 2026

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 35 | Lido Research Forum | `research.lido.fi` | research.lido.fi | Discourse | GOVERNANCE | **4/5** | ACTIVE | Largest liquid staking protocol. Dual governance, validator selection. |
| 36 | Compound Community | `comp.xyz` | comp.xyz | Discourse | GOVERNANCE | **4/5** | ACTIVE | Pioneer DeFi lending. Governance proposals, risk parameters. |
| 37 | Curve Governance | `gov.curve.finance` | gov.curve.finance | Discourse | GOVERNANCE | **4/5** | ACTIVE | Largest stableswap DEX. Gauge weights, CRV emissions, crvUSD. |
| 38 | ENS DAO | `discuss.ens.domains` | discuss.ens.domains | Discourse | GOVERNANCE | **4/5** | ACTIVE | ENSIP standards, public goods funding. |
| 39 | EigenLayer Forum | `forum.eigenlayer.xyz` | forum.eigenlayer.xyz | Discourse | GOVERNANCE | **3/5** | ACTIVE | AVS design, slashing parameters, operator governance. |
| 40 | The Graph Forum | `forum.thegraph.com` | forum.thegraph.com | Discourse | GOVERNANCE | **3/5** | ACTIVE | Subgraph curation, indexer incentives. |
| 41 | Safe Forum | `forum.safe.global` | forum.safe.global | Discourse | GOVERNANCE | **3/5** | ACTIVE | Module standards, AA integration, Safe{Core} SDK. |
| 42 | Aave Governance | `governance.aave.com` | governance.aave.com | Discourse | GOVERNANCE | **4/5** | ACTIVE | Largest DeFi lending protocol. Risk parameters, GHO stablecoin, Aave v4. 1,500+ governance topics. |
| 43 | Sky (MakerDAO) | `forum.sky.money` | forum.sky.money | Discourse | GOVERNANCE | **3/5** | ACTIVE | Oldest major DeFi protocol. Rebranded Sep 2024. HTML pages behind Cloudflare but JSON/RSS API works. |

**Tier 8 Verdict**: All 9 use existing `DiscourseFetcher`. Zero new code needed.

### Tier 9: Additional L2 Governance (4 sources) — ADDED Feb 2026

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 42 | Scroll Governance | `forum.scroll.io` | forum.scroll.io | Discourse | GOVERNANCE | **3/5** | ACTIVE | Governance Council, grants, protocol upgrades. |
| 43 | Polygon Community | `forum.polygon.technology` | forum.polygon.technology | Discourse | GOVERNANCE | **3/5** | ACTIVE | PIP proposals, Protocol Council. |
| 44 | Linea Community | `community.linea.build` | community.linea.build | Discourse | GOVERNANCE | **3/5** | ACTIVE | ConsenSys-backed. Decentralization roadmap. |
| 45 | Taiko Community | `community.taiko.xyz` | community.taiko.xyz | Discourse | GOVERNANCE | **3/5** | ACTIVE | Based rollup governance. Decentralized sequencing. |

**Tier 9 Verdict**: All 4 use existing `DiscourseFetcher`. Zero new code needed.

### Tier 10: MEV / PBS (3 sources) — ADDED Feb 2026

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 46 | Flashbots Collective Forum | `collective.flashbots.net` | collective.flashbots.net | Discourse | RESEARCH | **4/5** | ACTIVE | MEV research hub. Hosts "The MEV Letter" weekly. |
| 47 | Flashbots PM | `github.com/flashbots/pm` | github.com/flashbots/pm | GitHub API | RESEARCH | **4/5** | ACTIVE | Meeting notes, roadmaps, agendas. |
| 48 | MEV-Boost Relay | `github.com/flashbots/mev-boost-relay` | github.com/flashbots/mev-boost-relay | GitHub API | UPGRADE | **4/5** | ACTIVE | Reference relay implementation. |

**Tier 10 Verdict**: Discourse + GitHub fetchers. Zero new code needed.

### Tier 11: Standards & Developer Tooling (3 sources) — ADDED Feb 2026

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 49 | Rollup Improvement Proposals | `github.com/ethereum/RIPs` | github.com/ethereum/RIPs | GitHub API | EIP_ERC | **5/5** | ACTIVE | L2-specific protocol standards. |
| 50 | ERC-4337 Account Abstraction | `github.com/eth-infinitism/account-abstraction` | github.com/eth-infinitism/account-abstraction | GitHub API | EIP_ERC | **5/5** | ACTIVE | Reference AA implementation. 40M+ smart accounts. |
| 51 | Foundry Releases | `github.com/foundry-rs/foundry` | github.com/foundry-rs/foundry | RSS (Atom) | UPGRADE | **5/5** | ACTIVE | Forge/Cast/Anvil release tracking. |

**Tier 11 Verdict**: GitHub API + RSS fetchers. Zero new code needed.

### Tier 12: Research & Security Blogs (4 sources) — ADDED Feb 2026

| # | Source | ID in codebase | URL | Type | Category | Rating | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 52 | Jon Charbonneau | `joncharbonneau.substack.com` | joncharbonneau.substack.com | RSS (Substack) | RESEARCH | **5/5** | ACTIVE | Landmark protocol research. PBS, MEV, rollup economics. |
| 53 | Trail of Bits Blog | `blog.trailofbits.com` | blog.trailofbits.com | RSS (WordPress) | SECURITY | **5/5** | ACTIVE | Leading security firm. Slither creator. |
| 54 | OpenZeppelin Blog | `blog.openzeppelin.com` | blog.openzeppelin.com | RSS | SECURITY | **5/5** | ACTIVE | Most widely used Solidity library. Security advisories. |
| 55 | Nethermind Blog | `nethermind.io/blog` | nethermind.io/blog | RSS | RESEARCH | **4/5** | ACTIVE | EL client team. EVM optimizations, formal verification. |

**Tier 12 Verdict**: All have RSS feeds. Existing `RssFetcher` works. Zero new code needed.

### P1: High-Signal Sources (5 sources) — ADDED Feb 2026

| # | Source | ID in codebase | URL | Type | Category | Rating | Fetcher | Notes |
|---|---|---|---|---|---|---|---|---|
| 56 | Rekt News | `rekt.news` | rekt.news | Custom scraper | SECURITY | **5/5** | `RektNewsFetcher` | HTML scraper for `article.post` elements. Exploit post-mortems. |
| 57 | Paradigm Research | `paradigm.xyz` | paradigm.xyz/writing | Custom scraper | RESEARCH | **5/5** | `ParadigmFetcher` | JSON extraction from `__NEXT_DATA__` script tag. |
| 58 | Flashbots Writings | `writings.flashbots.net` | writings.flashbots.net | RSS | RESEARCH | **5/5** | `RssFetcher` | Has RSS at `/rss.xml`. MEV, PBS, SUAVE research. |
| 59 | samczsun | `samczsun.com` | samczsun.com | RSS | SECURITY | **5/5** | `RssFetcher` | Has RSS at `/rss/`. Vulnerability disclosures. |
| 60 | Tim Beiko ACD Updates | `hackmd.io/@timbeiko/acd` | hackmd.io/@timbeiko/acd | Custom scraper | PROTOCOL_CALLS | **5/5** | `HackMdFetcher` | Scrapes index page for ACD update links. Gold standard. |

**P1 Verdict**: 3 custom scrapers built (`RektNewsFetcher`, `ParadigmFetcher`, `HackMdFetcher`). 2 sources have RSS (discovered during research — Flashbots Writings and samczsun both have feeds).

---

## 4. New Sources — Security & Audits

### Exploit Trackers & Incident Response

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 35 | **Rekt News** | rekt.news | HTML/Email | SECURITY | **5/5** | **INTEGRATED** | `RektNewsFetcher` (custom HTML scraper) | The definitive DeFi exploit post-mortem publication. Investigative journalism with root-cause analysis. Custom cheerio scraper built for `article.post` elements. |
| 36 | **SEAL (Security Alliance)** | securityalliance.org | Web | SECURITY | **5/5** | ACTIVE | HTML scraper | Founded by samczsun. 501(c)(3). Coordinates SEAL 911 emergency response. Recovered $50M+ from attacks. Low publishing frequency, extremely high impact. |
| 37 | **samczsun's Blog** | samczsun.com | Blog | SECURITY | **5/5** | **INTEGRATED** | `RssFetcher` (RSS at `/rss/`) | Most respected white-hat in Ethereum. Detailed vulnerability disclosures. Publishes infrequently but each post is landmark-level. Has RSS feed (discovered during integration). |
| 38 | **DeFiHackLabs** | github.com/SunWeb3Sec/DeFiHackLabs | GitHub | SECURITY | **4/5** | ACTIVE | GitHub API | Repository of reproducible DeFi hack PoCs. Educational. Shows exactly how exploits work on-chain. |

### Audit Firm Blogs

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 39 | **Trail of Bits** | blog.trailofbits.com | Blog | SECURITY | **5/5** | **INTEGRATED** | `RssFetcher` (WordPress `/feed/`) | Leading security firm. Created Slither static analyzer. Deep technical research on smart contract security. |
| 40 | **OpenZeppelin** | blog.openzeppelin.com | Blog | SECURITY | **5/5** | **INTEGRATED** | `RssFetcher` (RSS feed) | Maintains the most widely used Solidity library. Security advisories, vulnerability disclosures. Integrated via RSS. |
| 41 | **ConsenSys Diligence** | consensys.io/diligence/blog | Blog | SECURITY | **4/5** | ACTIVE | RSS likely | Security team behind MetaMask/Infura. Audit findings, secure development guides. |
| 42 | **ChainSecurity** | chainsecurity.com/blog | Blog | SECURITY | **4/5** | ACTIVE | RSS likely | Swiss firm. Caught the Constantinople reentrancy bug pre-mainnet. Audits DeFi and CBDCs. |
| 43 | **Cyfrin** | cyfrin.io/blog | Blog | SECURITY | **4/5** | ACTIVE | RSS likely | Founded by Patrick Collins. DeFi security focus. Runs Updraft courses. Educational + audit. |
| 44 | **Zellic** | zellic.io/blog | Blog | SECURITY | **3/5** | ACTIVE | RSS likely | Specializes in ZK proof and L2 security audits. Publishes vulnerability research. Newer firm. |
| 45 | **Halborn** | halborn.com/blog | Blog | SECURITY | **3/5** | ACTIVE | RSS likely | Blockchain security advisory. Threat intelligence reports. More marketing-heavy than Trail of Bits. |

### Audit Contest Platforms

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 46 | **Code4rena** | code4rena.com | Platform | SECURITY | **4/5** | ACTIVE (contests running) | GitHub org (`code-423n4`) for reports | Competitive audit marketplace. Public reports reveal real vulnerabilities. Quality varies by contest (crowdsourced). |
| 47 | **Sherlock** | audits.sherlock.xyz | Platform | SECURITY | **4/5** | ACTIVE (Aave v4 judging) | docs.sherlock.xyz for reports | Higher bar than Code4rena. Coverage guarantees. Detailed public reports. |
| 48 | **Cantina** | cantina.xyz | Platform | SECURITY | **3/5** | ACTIVE | No documented API | AI-native security platform. Newer, less track record than Code4rena/Sherlock. |
| 49 | **CodeHawks** | codehawks.cyfrin.io | Platform | SECURITY | **3/5** | ACTIVE | No documented API | Cyfrin's competitive audit platform. Growing but smaller contest ecosystem. |
| 50 | **Immunefi** | immunefi.com | Platform | SECURITY | **5/5** | ACTIVE (650+ protocols) | Newsletter only | Web3's largest bug bounty platform. $190B+ in protected funds. 330+ projects. No public API for bounty data. |
| 51 | **Hats Finance** | hats.finance | Platform | SECURITY | **3/5** | ACTIVE | No documented API | Decentralized, on-chain bug bounty protocol. Newer, smaller than Immunefi. |

---

## 5. New Sources — Research Blogs

| # | Source | URL | Type | Category | Rating | Status | Integration | Bias/Notes |
|---|---|---|---|---|---|---|---|---|
| 52 | **Paradigm Research** | paradigm.xyz/writing | Blog | RESEARCH | **5/5** | **INTEGRATED** | `ParadigmFetcher` (JSON from `__NEXT_DATA__`) | Industry-leading crypto fund. Open-source research on MEV, crypto, protocol design. Created Foundry and Reth. Custom scraper extracts posts from Next.js page props. **Bias**: VC portfolio company promotion possible but research quality is independently verifiable. |
| 53 | **Flashbots Writings** | writings.flashbots.net | Blog | RESEARCH | **5/5** | **INTEGRATED** | `RssFetcher` (RSS at `/rss.xml`) | Deep research on MEV, PBS, SUAVE, BuilderNet. Flashbots created MEV-Boost which powers ~95% of Ethereum blocks. Has RSS feed (discovered during integration). |
| 54 | **a16z Crypto Research** | a16zcrypto.com/posts | Blog | RESEARCH | **4/5** | ACTIVE | HTML scraper (no RSS visible) | Lab led by Tim Roughgarden. Mechanism design, cryptography, web3 primitives. Annual "State of Crypto" report. **Bias**: Heavy VC investment bias — may promote portfolio companies. Research quality is high but framing can be self-serving. |
| 55 | **Barnabe.eth (EF Researcher)** | mirror.xyz/barnabe.eth | Mirror | RESEARCH | **5/5** | ACTIVE | Mirror RSS | Ethereum Foundation researcher. PBS, MEV, and protocol economics. No commercial bias — EF funded. |
| 56 | **Jon Charbonneau** | joncharbonneau.substack.com | Substack | RESEARCH | **5/5** | **INTEGRATED** | `RssFetcher` (Substack `/feed`) | Deep Ethereum protocol research. PBS, MEV, rollup economics. Infrequent but landmark-quality posts. Independent researcher — minimal bias. |
| 57 | **Ethereum Protocol Wiki** | epf.wiki | Wiki | RESEARCH | **5/5** | ACTIVE | HTML scraper | Community-maintained knowledge base. Execution/consensus layer specs, client architecture, testing infra. Definitive reference. |
| 58 | **Gauntlet** | gauntlet.xyz/resources | Blog | RESEARCH | **4/5** | ACTIVE | HTML scraper | DeFi risk management platform. Quantitative research on protocol risk, simulations, market dynamics. **Bias**: Promotes own risk management services but research methodology is rigorous. |
| 59 | **Nethermind Blog** | nethermind.io/blog | Blog | RESEARCH | **4/5** | **INTEGRATED** | `RssFetcher` (RSS `/blog/feed/`) | Ethereum EL client team. EVM optimizations, formal verification, protocol research. First-party client team perspective. |
| 60 | **Lambda Class** | blog.lambdaclass.com | Blog | RESEARCH | **4/5** | ACTIVE | RSS likely | Deep technical content on ZK-proofs, EVM internals, Ethereum tooling. Engineering-focused, minimal bias. |
| 61 | **Delphi Digital** | delphidigital.io | Platform | RESEARCH | **4/5** | ACTIVE | Paywalled (some free) | Data-driven research reports. Deep dives on Ethereum roadmap, L2 economics. **Bias**: Paid research model, but well-regarded. Some content is free. |

### Dead/Discontinued Research Sources (DO NOT ADD)

| Source | URL | Status | Notes |
|---|---|---|---|
| ~~Polynya~~ | polynya.mirror.xyz | **DEAD** | Blog concluded by author. All content CC0 archived. Was excellent on L2 scaling. |
| ~~The Daily Gwei~~ | thedailygwei.substack.com | **DEAD** | Discontinued ~August 2022. Last post was #532. |

---

## 6. New Sources — L2 Governance Forums

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 62 | **Scroll Governance** | forum.scroll.io | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | Governance Council, grants, protocol upgrade discussions. Weekly governance recaps. Newer forum, growing activity. |
| 63 | **Polygon Community** | forum.polygon.technology | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | PIP proposals, 13-member Protocol Council, PPGC call notes. Comprehensive governance structure. |
| 64 | **Mantle Governance** | forum.mantle.xyz | Discourse | GOVERNANCE | **3/5** | ACTIVE | `/latest.rss` + JSON API | Mantle DAO governance. Treasury management, protocol proposals, ecosystem grants. |
| 65 | **Blast Governance** | forum.blast.io | Discourse | GOVERNANCE | **3/5** | ACTIVE | `/latest.rss` + JSON API | Progress Council governance. BLIPs (Blast Improvement Proposals). |
| 66 | **Linea Community** | community.linea.build | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | ConsenSys-backed. Decentralization roadmap discussions. |
| 67 | **Taiko Community** | community.taiko.xyz | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | Based rollup governance. Decentralized sequencing discussions. |
| 68 | **Mode Governance** | forum.mode.network | Discourse | GOVERNANCE | **2/5** | ACTIVE (low) | `/latest.rss` + JSON API | OP Stack L2. Lower activity compared to others. |

**Note**: Base does not have its own governance forum — it operates under Optimism Collective governance (already tracked at `gov.optimism.io`).

---

## 7. New Sources — MEV / PBS

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 69 | **Flashbots Collective Forum** | collective.flashbots.net | Discourse | RESEARCH | **4/5** | **INTEGRATED** | `DiscourseFetcher` | Central hub for MEV research discussions. Hosts "The MEV Letter" — weekly curated newsletter of MEV papers and articles. |
| 70 | **MEV Watch** | mevwatch.info | Dashboard | METRICS | **4/5** | ACTIVE (real-time) | No documented API | Tracks OFAC-compliant relay usage. Monitors censorship resistance of block production. On-chain data — factually reliable. |
| 71 | **Relayscan** | relayscan.io | Dashboard | METRICS | **5/5** | ACTIVE (Feb 2026, real-time) | Bid archive; open-source (GitHub) | MEV-Boost relay monitoring. Relay market share, bid data, builder statistics. Best relay analytics tool. |
| 72 | **Flashbots PM** | github.com/flashbots/pm | GitHub | RESEARCH | **4/5** | **INTEGRATED** | `GitHubRepoFetcher` | Meeting notes, roadmaps, agendas for all Flashbots initiatives. |
| 73 | **Flashbots mev-boost-relay** | github.com/flashbots/mev-boost-relay | GitHub | UPGRADE | **4/5** | **INTEGRATED** | `GitHubRepoFetcher` | Reference relay implementation. Issues and PRs reveal relay design evolution. |
| 74 | **MEV Blocker** | mevblocker.io | Dashboard | METRICS | **3/5** | ACTIVE | No documented API | CoW Protocol's MEV protection service. Tracks protection usage and refund data. Somewhat promotional for CoW. |
| 75 | **ethernow.xyz** | ethernow.xyz | Explorer | METRICS | **3/5** | ACTIVE | No documented API | Real-time Ethereum mempool explorer. "Etherscan for pre-chain data." Pending transactions visualization. |

---

## 8. New Sources — DeFi Protocol Governance

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 76 | **Aave Governance** | governance.aave.com | Discourse | GOVERNANCE | **4/5** | **INTEGRATED** | `DiscourseFetcher` | Largest lending protocol. Standard Discourse — `/latest.json` and `/latest.rss` both work. 1,500+ governance topics across 8 categories. |
| 77 | **Compound Community** | comp.xyz | Discourse | GOVERNANCE | **4/5** | **INTEGRATED** | `DiscourseFetcher` | Pioneer DeFi lending. Governance proposals, risk parameters, cross-chain expansion. |
| 78 | **Lido Research** | research.lido.fi | Discourse | GOVERNANCE | **4/5** | **INTEGRATED** | `DiscourseFetcher` | Largest liquid staking protocol. Dual governance, validator selection, fee structure. Very active. |
| 79 | **EigenLayer Forum** | forum.eigenlayer.xyz | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | AVS design, slashing parameters, operator governance. NOTE: `research.eigenlayer.xyz` redirects here. Mixed content quality. |
| 80 | **Sky (formerly MakerDAO)** | forum.sky.money | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | Oldest major DeFi protocol. Rebranded Sep 2024. HTML pages behind Cloudflare challenge but `/latest.json` and `/latest.rss` API endpoints work without auth. 13 categories, 1,300+ topics. |
| 81 | **Curve Governance** | gov.curve.finance | Discourse | GOVERNANCE | **4/5** | **INTEGRATED** | `DiscourseFetcher` | Largest stableswap DEX. Gauge weights, CRV emissions, pool parameters, crvUSD. |
| 82 | **ENS DAO** | discuss.ens.domains | Discourse | GOVERNANCE | **4/5** | **INTEGRATED** | `DiscourseFetcher` | Ethereum Name Service. ENSIP standards, public goods funding. Active weekly newsletter. |
| ~~83~~ | ~~**Chainlink Community**~~ | ~~community.chain.link~~ | — | — | — | **DEAD** | — | Domain `community.chain.link` returns NXDOMAIN — DNS removed. No Wayback Machine archives. Chainlink moved community to Discord/Reddit/Telegram. DO NOT ADD. |
| 84 | **The Graph Forum** | forum.thegraph.com | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | Indexing protocol. Subgraph curation, indexer incentives. Moderate activity. |
| 85 | **Safe Forum** | forum.safe.global | Discourse | GOVERNANCE | **3/5** | **INTEGRATED** | `DiscourseFetcher` | Most-used multisig. Module standards, AA integration, Safe{Core} SDK. |

---

## 9. New Sources — Ecosystem Newsletters & Blogs

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 86 | **Bankless** | bankless.com/newsletter | Newsletter | ANNOUNCEMENT | **3/5** | ACTIVE | RSS/HTML scraper | Leading Ethereum-focused newsletter. Weekly DeFi, protocol updates. **Bias**: Can be sensationalist/clickbaity. Strong Ethereum bull narrative. Use for trending signal, not primary facts. |
| 87 | **Tim Beiko's ACD Updates** | hackmd.io/@timbeiko/acd | HackMD | PROTOCOL_CALLS | **5/5** | **INTEGRATED** | `HackMdFetcher` (custom scraper) | Official summaries of AllCoreDevs calls. Primary source for protocol decisions. Tim Beiko is the ACD coordinator. Gold standard. |
| 88 | **EtherWorld** | etherworld.co | Blog | ANNOUNCEMENT | **3/5** | ACTIVE | RSS likely | Covers protocol upgrades, EIP analysis, core dev meeting recaps. Lower production quality but useful coverage. |
| 89 | **EthStaker (Paragraph)** | paragraph.com/@ethstaker | Newsletter | ANNOUNCEMENT | **4/5** | ACTIVE (Jul 2025) | No visible RSS | Client diversity advocacy, staking guides, validator resources. Community-driven, no commercial bias. Low frequency. |

### Dead/Discontinued Newsletters (DO NOT ADD)

| Source | URL | Status | Notes |
|---|---|---|---|
| ~~Week in Ethereum~~ | weekinethereum.substack.com | **DEAD** | Already in codebase — REMOVE. Discontinued Jan 2025. |
| ~~The Daily Gwei~~ | thedailygwei.substack.com | **DEAD** | Discontinued ~Aug 2022. |
| ~~Polynya~~ | polynya.mirror.xyz | **DEAD** | Blog concluded. |

---

## 10. New Sources — Data & Analytics

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 90 | **L2BEAT** | l2beat.com | Dashboard | METRICS | **5/5** | ACTIVE (continuous) | Structured data; no documented public API | Definitive L2 analytics. TVS, risk assessments, DA tracking, bridge risk. Open source. Industry reference. |
| 91 | **ultrasound.money** | ultrasound.money | Dashboard | METRICS | **5/5** | ACTIVE (Feb 2026, real-time) | **REST API** (`/api/v2/fees/*`) | Real-time ETH supply tracker. Issuance vs burn (EIP-1559). Has documented API endpoints. |
| 92 | **beaconcha.in** | beaconcha.in | Explorer | METRICS | **5/5** | ACTIVE (continuous) | REST API + relay data | CL explorer. Validator performance, staking rewards (ETH.STORE rate), relay data, client diversity. |
| 93 | **Rated Network** | rated.network | Dashboard | METRICS | **5/5** | ACTIVE (continuous) | **Comprehensive REST API** (console.rated.network) | Validator/operator ratings. Relay reliability, uptime, staking infra analytics. Well-documented API. |
| 94 | **Blobscan** | blobscan.com | Explorer | METRICS | **4/5** | ACTIVE | API likely (explorer pattern) | First dedicated EIP-4844 blob explorer. Blob transactions, L2 blob usage, DA costs. |
| 95 | **clientdiversity.org** | clientdiversity.org | Dashboard | METRICS | **5/5** | ACTIVE (daily) | Blockprint API reference | Official client diversity data. EL and CL client distribution tracking. Essential for network health monitoring. |
| 96 | **Dune Analytics** | dune.com | Platform | METRICS | **4/5** | ACTIVE | Free API tier | Community-driven SQL blockchain analytics. Thousands of Ethereum dashboards. Data quality depends on query author. |
| 97 | **Token Terminal** | tokenterminal.com | Platform | METRICS | **4/5** | ACTIVE | API (some paywalled) | Revenue, fees, P/E ratios for DeFi protocols and L2s. Traditional finance metrics applied to crypto. |
| 98 | **Messari** | messari.io | Platform | METRICS | **4/5** | ACTIVE | API (mostly paywalled) | Research reports, governance tracking, token unlocks, fundraising data. **Bias**: Business model may influence coverage. Some free data. |
| 99 | **Snapshot** | snapshot.org | Platform | GOVERNANCE | **5/5** | ACTIVE | **GraphQL API** | Off-chain voting platform used by most DAOs. Can track votes across all major protocols. No bias — neutral infrastructure. |
| 100 | **Tally** | tally.xyz | Platform | GOVERNANCE | **4/5** | ACTIVE | REST API | On-chain governance aggregator. Proposals, delegates, voting for Compound, Uniswap, ENS, etc. |

---

## 11. New Sources — Developer Tooling

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 101 | **Foundry Releases** | github.com/foundry-rs/foundry | GitHub | UPGRADE | **5/5** | **INTEGRATED** | `RssFetcher` (GitHub releases Atom) | Standard Solidity dev framework. Forge, Cast, Anvil. Paradigm-built. Track releases for breaking changes. |
| 102 | **Alchemy Blog** | alchemy.com/blog | Blog | ANNOUNCEMENT | **3/5** | ACTIVE | RSS likely | "AWS for Web3". SDK updates, AA tooling, debugging tools. **Bias**: Promotional for own products. Technical content is reliable but filtered through product lens. |
| 103 | **Tenderly Blog** | blog.tenderly.co | Blog | ANNOUNCEMENT | **3/5** | ACTIVE | RSS likely | Smart contract debugging, simulation, monitoring. **Bias**: Product-focused content. Useful for developer ecosystem awareness. |
| 104 | **Wagmi / Viem (wevm)** | github.com/wevm | GitHub | UPGRADE | **5/5** | ACTIVE | GitHub API (releases) | Dominant TypeScript libraries for Ethereum frontend dev. Track releases for breaking changes and new features. |
| 105 | **Blockscout Blog** | blog.blockscout.com | Blog | ANNOUNCEMENT | **3/5** | ACTIVE | RSS likely | Open-source block explorer. EIP support (blobs, AA), explorer features. Community-driven. |

---

## 12. New Sources — Standards & Working Groups

| # | Source | URL | Type | Category | Rating | Status | Integration | Notes |
|---|---|---|---|---|---|---|---|---|
| 106 | **ERC-4337 Account Abstraction** | github.com/eth-infinitism/account-abstraction | GitHub | EIP_ERC | **5/5** | **INTEGRATED** | `GitHubRepoFetcher` | Reference AA implementation. 40M+ smart accounts deployed. Issues/PRs track AA evolution. |
| 107 | **Rollup Improvement Proposals (RIPs)** | github.com/ethereum/RIPs | GitHub | EIP_ERC | **5/5** | **INTEGRATED** | `GitHubRepoFetcher` | L2-specific protocol standards. Cross-L2 interoperability standards. Canonical repo. |
| 108 | **Ethereum Protocol Fellowship** | github.com/eth-protocol-fellows | GitHub | RESEARCH | **4/5** | ACTIVE | GitHub API | Cohort projects, protocol studies, wiki contributions. Next generation of core developers. |
| 109 | **EthStaker Community** | ethstaker.org | Community | ANNOUNCEMENT | **4/5** | ACTIVE | Custom | Client diversity advocacy, staking guides, validator resources. No commercial bias. |
| 110 | **Ethereum R&D Discord Guidebook** | github.com/tvanepps/EthereumDiscordGuidebook | GitHub | RESEARCH | **3/5** | VARIES | GitHub API | Guidebook to bleeding-edge research topics. Activity depends on maintainer. |

---

## 13. Integration Feasibility by Type

| Integration Type | Count | Effort | How to Integrate |
|---|---|---|---|
| **Discourse Forums** | ~25 sources | LOW | Standard Discourse API: `/latest.json`, `/posts.json`, `/latest.rss`. All use the same fetcher class already built (`DiscourseFetcher`). |
| **GitHub Repos** | ~15 sources | LOW | GitHub REST API for releases, issues, PRs. Already built (`GitHubRepoFetcher`). Just add new source entries. |
| **Substack/Mirror** | ~5 sources | LOW | RSS feeds at `/feed` endpoint. Already built (`RssFetcher`). |
| **Blog/RSS** | ~15 sources | LOW-MEDIUM | Standard RSS where available. Some blogs (Paradigm, Flashbots, samczsun) have no RSS — need HTML scraper or custom fetcher. |
| **REST APIs** | ~8 sources | MEDIUM | Each API has different schema. Need custom fetchers for ultrasound.money, rated.network, Snapshot GraphQL, etc. |
| **Dashboards (no API)** | ~5 sources | HIGH | MEV Watch, L2BEAT, etc. Would need HTML scraping or periodic screenshot/data extraction. |
| **Paywalled Platforms** | ~3 sources | N/A | Delphi Digital, Token Terminal (partial), Messari (partial). Cannot integrate paywalled content. Only use free endpoints. |

### Sources Ready for Immediate Integration (Existing Fetchers Work)

These sources can be added to `sources.ts` today with zero new code:

**Discourse forums** (use existing `DiscourseFetcher`):
- forum.scroll.io, forum.polygon.technology, forum.mantle.xyz, community.linea.build, community.taiko.xyz
- governance.aave.com (may need testing), comp.xyz, research.lido.fi, forum.eigenlayer.xyz
- gov.curve.finance, discuss.ens.domains, forum.thegraph.com, forum.safe.global
- collective.flashbots.net

**GitHub repos** (use existing `GitHubRepoFetcher`):
- github.com/foundry-rs/foundry, github.com/eth-infinitism/account-abstraction
- github.com/ethereum/RIPs, github.com/flashbots/pm, github.com/flashbots/mev-boost-relay

**Substack** (use existing `RssFetcher`):
- joncharbonneau.substack.com

---

## 14. Priority Ranking — What to Add First

### P0 — Fix Existing Issues ~~(do first)~~ DONE

| Action | Effort | Status |
|---|---|---|
| Remove `weekinethereum.substack.com` from sources.ts | 5 min | **DONE** |
| Verify remaining sources still resolve | 15 min | **DONE** |

### P1 — Highest Signal New Sources ~~(add next)~~ DONE

| Source | Why | Type | Status |
|---|---|---|---|
| **Tim Beiko ACD Updates** | Primary source for all protocol decisions. | HackMD | **DONE** — `HackMdFetcher` custom scraper |
| **Rekt News** | Only source for detailed exploit post-mortems. | HTML | **DONE** — `RektNewsFetcher` custom scraper |
| **Flashbots Collective Forum** | MEV is core to how Ethereum works. | Discourse | **DONE** — `DiscourseFetcher` |
| **Jon Charbonneau** | Landmark-quality protocol research. | Substack | **DONE** — `RssFetcher` |
| **Lido Research Forum** | Liquid staking is systemically important. | Discourse | **DONE** — `DiscourseFetcher` |
| **Aave Governance** | Largest DeFi lending protocol. | Discourse | **DONE** — `DiscourseFetcher` (standard Discourse confirmed) |
| **Sky (MakerDAO)** | Oldest major DeFi protocol. | Discourse | **DONE** — `DiscourseFetcher` (JSON API works past Cloudflare) |
| **L2BEAT** | Definitive L2 risk data. | API/Scraper | Not yet — no documented public API |

### P2 — Strong Additions ~~(add when ready)~~ MOSTLY DONE

| Source | Why | Type | Status |
|---|---|---|---|
| ENS DAO, Compound, Curve, EigenLayer forums | Complete DeFi governance coverage | Discourse | **DONE** — All 7 DeFi governance forums integrated |
| Scroll, Polygon, Linea, Taiko forums | Complete L2 governance coverage | Discourse | **DONE** — All 4 additional L2 forums integrated |
| Paradigm Research, Flashbots Writings | Highest quality research blogs | Custom/RSS | **DONE** — Paradigm (custom), Flashbots (RSS) |
| Trail of Bits, OpenZeppelin blogs | Security research from top firms | RSS | **DONE** — Both via `RssFetcher` |
| ultrasound.money, rated.network | Best APIs for ETH supply and validator data | REST API | Not yet — needs custom REST fetchers |
| clientdiversity.org, beaconcha.in | Network health monitoring | API | Not yet — needs custom fetchers |
| Foundry releases, RIPs repo | Developer tooling + L2 standards | GitHub/RSS | **DONE** — Foundry (RSS), RIPs (GitHub) |
| Snapshot | Cross-DAO voting data | GraphQL | Not yet — needs GraphQL fetcher |

### P3 — Future Candidates (not yet integrated)

| Source | Why | Type | Integration Effort |
|---|---|---|---|
| ~~Aave Governance~~ | ~~Largest DeFi lending.~~ | ~~Discourse~~ | **DONE** — Integrated Feb 2026 |
| L2BEAT | Definitive L2 risk data. No documented public API. | API/Scraper | Medium-High |
| ultrasound.money | ETH supply tracking. REST API available. | REST API | Medium |
| rated.network | Validator/operator ratings. Comprehensive REST API. | REST API | Medium |
| Snapshot | Cross-DAO voting. GraphQL API. | GraphQL | Medium |
| beaconcha.in | CL explorer. REST API + relay data. | REST API | Medium |
| clientdiversity.org | Client distribution tracking. | API | Medium |
| Mantle, Blast, Mode forums | Remaining L2 governance. Lower priority. | Discourse | Low |
| SEAL, DeFiHackLabs | Security incident tracking. | HTML/GitHub | Medium |
| a16z, Barnabe.eth, Lambda Class | Additional research blogs. | HTML/RSS | Low-Medium |

---

## Source Count Summary

| Category | Implemented | Remaining Candidates | Total Identified |
|---|---|---|---|
| Tier 1: Core Protocol | 8 | 0 | 8 |
| Tier 2: Community Intelligence | 3 | 3 | 6 |
| Tier 3: L2 Governance | 5 | 3 (Mantle, Blast, Mode) | 8 |
| Tier 5: Client Releases | 10 | 0 | 10 |
| Tier 6: On-Chain Metrics (DefiLlama) | 3 | 0 | 3 |
| Tier 7: Crypto Social | 4 | 0 | 4 |
| Tier 8: DeFi Protocol Governance | 9 | 0 (Chainlink DEAD) | 9 |
| Tier 9: Additional L2 Governance | 4 | 0 | 4 |
| Tier 10: MEV / PBS | 3 | 4 (MEV Watch, Relayscan, etc.) | 7 |
| Tier 11: Standards & Dev Tooling | 3 | 4 (Wagmi/Viem, etc.) | 7 |
| Tier 12: Research & Security RSS | 4 | 5 (a16z, Barnabe, etc.) | 9 |
| P1: High-Signal Custom Scrapers | 5 | 0 | 5 |
| Security & Audits (unintegrated) | — | ~12 (SEAL, Code4rena, etc.) | 12 |
| Data & Analytics (unintegrated) | — | ~10 (L2BEAT, ultrasound, etc.) | 10 |
| **TOTAL** | **61** | **~47** | **~113** |

### Integration Progress

- **Feb 27, 2026**: Initial audit. 32 sources implemented across Tiers 1–7.
- **Feb 28, 2026**: Expanded to **59 sources**. Added:
  - 7 DeFi governance forums (Tier 8)
  - 4 L2 governance forums (Tier 9)
  - 3 MEV/PBS sources (Tier 10)
  - 3 standards/tooling sources (Tier 11)
  - 4 research/security RSS feeds (Tier 12)
  - 5 P1 high-signal sources with 3 custom scrapers
  - Removed 1 dead source (weekinethereum)
- **Pipeline improvements**: Quality scoring (auto-suppress < 0.25), category classifier for all 59 sources, PWA offline page + install prompt.
- **Feb 28, 2026 (batch 2)**: Expanded to **61 sources**. Added:
  - Aave Governance (confirmed standard Discourse — `/latest.json` works)
  - Sky/MakerDAO (confirmed standard Discourse — JSON/RSS API bypasses Cloudflare challenge)
  - Marked Chainlink Community as DEAD (domain `community.chain.link` returns NXDOMAIN)
