<div align="center">

# `[ hexcast ]`

**Ethereum ecosystem intelligence — 60 words at a time.**

[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](./LICENSE)
[![Status](https://img.shields.io/badge/status-live-22c55e?style=flat-square)]()
[![Sources](https://img.shields.io/badge/sources-70%2B-3b82f6?style=flat-square)]()
[![Categories](https://img.shields.io/badge/categories-8-3b82f6?style=flat-square)]()
[![Built with Next.js](https://img.shields.io/badge/Next.js-15-0c0c14?style=flat-square&logo=next.js&logoColor=3b82f6)](https://nextjs.org)

<br/>

> Protocol updates. Governance votes. Security incidents. Client releases.<br/>
> Every signal that moves the Ethereum ecosystem — one card, 60 words, always free.

<br/>

![Hexcast Feed](https://placehold.co/900x500/06060a/3b82f6?text=hexcast+feed&font=mono)

<br/>

**[→ hexcast.xyz](https://hexcast.xyz)** &nbsp;·&nbsp; [Documentation](#how-it-works) &nbsp;·&nbsp; [Source List](./SOURCES.md) &nbsp;·&nbsp; [Report an Issue](https://github.com/your-org/hexcast/issues)

</div>

---

## The problem with Ethereum news

Most Ethereum coverage falls into one of two failure modes:

**Too broad** — general crypto outlets covering price action, not protocol mechanics. Governance votes and EIP status changes disappear beneath token price articles.

**Too slow** — curated newsletters publish once a week. By the time you read it, the All Core Devs call was five days ago and the Arbitrum vote already closed.

Week in Ethereum News filled this gap. It retired in January 2025. Hexcast picks up where it left off.

---

## What Hexcast is

A real-time intelligence feed built for people who build on Ethereum.

Hexcast monitors 70+ curated sources — protocol research forums, client repositories, governance portals, security researchers, DAO multisigs — and surfaces every significant development as a quality-scored, AI-summarized 60-word card. Updated continuously. Zero paywall. No email required.

```
70+ sources  →  quality filter  →  60-word AI summary  →  your feed
```

---

## Eight categories of signal

| Category | What it tracks |
|---|---|
| `RESEARCH` | Protocol proposals, EIPs in progress, core researcher posts, ethresear.ch threads |
| `EIP / ERC` | New proposals, status transitions (Draft → Review → Final), implementation discussions |
| `PROTOCOL CALLS` | All Core Devs agendas and summaries, consensus/execution layer decision logs |
| `GOVERNANCE` | DAO proposals, active votes, outcomes — Optimism, Arbitrum, Lido, Aave, ENS, and 14 others |
| `UPGRADE` | Client releases, testnet activations, hard fork timelines — all 10 Ethereum clients |
| `SECURITY` | Exploit post-mortems, audit publications, responsible disclosures, vulnerability advisories |
| `ANNOUNCEMENT` | Official communications from the Ethereum Foundation, L2 foundations, major protocols |
| `METRICS` | ETH supply, staking yield, L2 TVL, validator set composition, MEV relay data |

---

## Why 60 words

Sixty words is enough to answer three questions: **what happened**, **who was involved**, and **why it matters**. It is not enough to editorialize, speculate, or pad with context you already have.

Every card preserves the identifiers that matter to protocol developers: EIP numbers, vote percentages, client version strings, dollar amounts, author names. The original source is always one tap away.

---

## Source depth

**70+ sources across 12 tiers — including sources no other aggregator tracks:**

| Tier | Sources |
|---|---|
| Core Protocol | ethresear.ch · Ethereum Magicians · EIPs repo · ERCs repo · ACD PM · Forkcast · EF Blog · Vitalik |
| Community Intelligence | Ethereum Cat Herders · Christine Kim ACDC Notes · Ethereum Weekly Digest |
| L2 Governance | Optimism · Arbitrum · zkSync · Starknet · Scroll · Polygon · Linea · Taiko · Uniswap |
| DeFi Governance | Aave · Lido · Compound · Curve · ENS · EigenLayer · The Graph · Safe · Sky (MakerDAO) |
| MEV / PBS | Flashbots Collective · Flashbots PM · MEV-Boost Relay |
| Client Releases | Geth · Nethermind · Besu · Reth · Erigon · Lighthouse · Prysm · Teku · Nimbus · Lodestar |
| Research Blogs | Paradigm · Flashbots Writings · Jon Charbonneau · samczsun · Nethermind Blog |
| Security | Rekt News · Trail of Bits · OpenZeppelin |
| Standards | RIPs · ERC-4337 / Account Abstraction · Foundry |
| Metrics | DefiLlama (TVL · stablecoins · DEX volume) |
| Protocol Coordination | Tim Beiko ACD Updates |
| Crypto Signals | CryptoPanic (trending · hot · rising) |

Complete source registry — active sources, fetcher types, poll intervals, removed sources and reasons: [SOURCES.md](./SOURCES.md)
Quality rankings across 6 parameters (authority, signal density, ecosystem impact, uniqueness, time sensitivity, integration reliability): [SOURCE_RANKINGS.md](./SOURCE_RANKINGS.md)

---

## How it works

### 1 · Fetch
Discourse forums, GitHub APIs, RSS feeds, REST APIs, and custom scrapers run on rolling schedules — every 30 minutes for client release repos, every 2 hours for research forums, every 4 hours for EIP repositories. No manual curation step.

### 2 · Quality Score
Every item receives a `0.0–1.0` quality score before a human (or LLM) sees it:

```
score = (source_weight × 0.40) + (content_signals × 0.60)
```

Content signals evaluate: post length, technical term density, engagement metrics where available, and author reputation signals. Items scoring below `0.25` are suppressed automatically — they never reach the summarization step.

### 3 · Summarize
Claude Haiku generates a factual 60-word summary. Word count is validated (58–62 words accepted) with up to three retries per item. Critical technical identifiers — EIP numbers, vote percentages, client version strings, named authors — are checked for preservation before the card is written to the database. High-complexity content (long research threads, multi-part governance posts) routes to Claude Sonnet 4.6.

### 4 · Personalized Feed
Authenticated users receive unseen-first ordering. The feed tracks what you have read and always surfaces what you have not. Category filters apply globally. Source toggles let you remove any of the 70+ sources from your view permanently.

---

## The feed experience

- **Vertical snap-scroll** — one card per screen, swipe to advance
- **8-category filter bar** — tap to narrow to a single signal type
- **Unseen-first ordering** — authenticated users always see fresh cards first
- **Bookmark to reading list** — accessible on any device, works offline
- **React to cards** — thumbs up/down used to tune feed quality over time
- **Flag inaccuracies** — three-step flow; every flag is reviewed within 24 hours
- **Share natively** — X, Telegram, or copy link from any card
- **PWA** — installable on iOS and Android, no App Store required

---

## Accuracy commitment

**Target: 97% factual accuracy on weekly random sample audits.**

- Word count enforced at write time (58–62 words, up to 3 LLM retries)
- Entity preservation verified before card is committed to database
- All flagged cards reviewed within 24 hours
- Cards confirmed inaccurate are removed and reprocessed against original source
- Pipeline suspended automatically if accuracy drops below 95%

---


## Suggest a source

Hexcast's quality depends on its source selection. If you know a source that belongs in the feed, open an issue with:

1. The source URL
2. Why it belongs (what category, what signal it provides)
3. Whether it has machine-readable access (RSS, public API, Discourse `/latest.json`, or structured HTML)

Sources are evaluated against four criteria: Ethereum-native content, machine-readable access, published within the last 90 days, and a reliability score of 3/5 or above per the [SOURCES.md](./SOURCES.md) rubric.

Pull requests directly to [`packages/shared/src/constants/sources.ts`](./packages/shared/src/constants/sources.ts) are welcome. Each source entry requires `id`, `display_name`, `base_url`, `api_type`, `poll_interval_s`, and `default_category`.

---

## License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">

`[ hexcast ]` &nbsp;·&nbsp; ethereum ecosystem intelligence &nbsp;·&nbsp; February 2026

**[hexcast.xyz →](https://hexcast.xyz)**

</div>
