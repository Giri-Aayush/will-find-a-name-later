<div align="center">

# `[ hexcast ]` · Source Quality Rankings

**Six parameters. One composite score. Every source ranked.**

[![Sources](https://img.shields.io/badge/sources-88-22c55e?style=flat-square)]()
[![Parameters](https://img.shields.io/badge/parameters-6-3b82f6?style=flat-square)]()
[![S%20tier](https://img.shields.io/badge/S%20tier-29%20sources-3b82f6?style=flat-square)]()
[![Updated](https://img.shields.io/badge/updated-February%202026-8a8a9a?style=flat-square)]()

<br/>

> How much signal does each source actually deliver to the feed?<br/>
> Scored quarterly across six parameters. Drives pipeline weights, feed priority, and removal decisions.

<br/>

**[→ hexcast.xyz](https://hexcast.xyz)** &nbsp;·&nbsp; [README](./README.md) &nbsp;·&nbsp; [Source Registry](./SOURCES.md)

</div>

---

## Methodology

Every source in Hexcast is scored across six parameters. The composite score determines default quality weight in the pipeline, feed priority, and which sources are recommended for removal or promotion.

### Parameters

| Parameter | Weight | What it measures |
|---|---|---|
| **Content Authority** | 25% | Is this the primary, canonical source — or does it report on things that originated elsewhere? |
| **Signal Density** | 25% | What fraction of posts from this source are genuinely worth surfacing to a protocol developer or DeFi builder? |
| **Ecosystem Impact** | 20% | When something is published here, how widely does it affect decisions or actions across Ethereum? |
| **Uniqueness** | 15% | How much content does this source produce that cannot be found anywhere else? |
| **Time Sensitivity** | 10% | How urgently does a Hexcast user need to know when new content appears? |
| **Integration Reliability** | 5% | How stable and resilient is the data fetch? Affects product quality directly. |

**Scoring scale:** 1 (lowest) to 5 (highest) per parameter.

**Composite formula:**

```
score = (authority × 0.25) + (signal × 0.25) + (impact × 0.20) + (uniqueness × 0.15) + (timeliness × 0.10) + (reliability × 0.05)
```

**Score bands:**

| Band | Score | Interpretation |
|---|---|---|
| S | 4.50 – 5.00 | Foundational. Never remove. Pipeline weight: 0.90–1.00 |
| A | 4.00 – 4.49 | High value. Core feed signal. Pipeline weight: 0.80–0.89 |
| B | 3.50 – 3.99 | Solid. Contextual signal. Pipeline weight: 0.65–0.79 |
| C | 3.00 – 3.49 | Marginal. High noise, niche reach. Pipeline weight: 0.50–0.64 |
| D | < 3.00 | Review for removal. Low signal, duplicative, or fragile. |

---

## Master Rankings

| Rank | Source | Auth | Signal | Impact | Unique | Time | Rel | **Score** | Band |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Solidity Compiler Releases | 5 | 5 | 5 | 5 | 5 | 5 | **5.00** | S |
| 1 | Geth (go-ethereum) | 5 | 5 | 5 | 5 | 5 | 5 | **5.00** | S |
| 3 | rekt.news | 5 | 5 | 5 | 5 | 5 | 2 | **4.85** | S |
| 3 | samczsun — Security Research | 5 | 5 | 5 | 5 | 4 | 4 | **4.85** | S |
| 5 | Ethereum Research (ethresear.ch) | 5 | 5 | 5 | 5 | 3 | 5 | **4.80** | S |
| 5 | Nethermind | 5 | 5 | 4 | 5 | 5 | 5 | **4.80** | S |
| 5 | Reth | 5 | 5 | 4 | 5 | 5 | 5 | **4.80** | S |
| 5 | Lighthouse | 5 | 5 | 4 | 5 | 5 | 5 | **4.80** | S |
| 5 | Prysm | 5 | 5 | 4 | 5 | 5 | 5 | **4.80** | S |
| 10 | Tim Beiko — ACD Updates | 5 | 5 | 5 | 5 | 4 | 2 | **4.75** | S |
| 11 | Foundry (Forge/Cast/Anvil) | 5 | 5 | 4 | 5 | 4 | 5 | **4.70** | S |
| 12 | Vitalik Buterin's Blog | 5 | 5 | 5 | 5 | 2 | 4 | **4.65** | S |
| 13 | Christine Kim — ACDC Notes | 4 | 5 | 5 | 5 | 4 | 4 | **4.60** | S |
| 13 | Trail of Bits Blog | 5 | 5 | 4 | 5 | 3 | 5 | **4.60** | S |
| 13 | Besu | 5 | 5 | 3 | 5 | 5 | 5 | **4.60** | S |
| 13 | Erigon | 5 | 5 | 3 | 5 | 5 | 5 | **4.60** | S |
| 13 | Teku | 5 | 5 | 3 | 5 | 5 | 5 | **4.60** | S |
| 13 | Nimbus | 5 | 5 | 3 | 5 | 5 | 5 | **4.60** | S |
| 13 | Vyper Compiler Releases | 5 | 5 | 3 | 5 | 5 | 5 | **4.60** | S |
| 20 | Ethereum Magicians | 5 | 4 | 5 | 5 | 3 | 5 | **4.55** | S |
| 20 | ACD Project Management (ethereum/pm) | 5 | 4 | 5 | 5 | 3 | 5 | **4.55** | S |
| 20 | Ethereum Foundation Blog | 5 | 4 | 5 | 5 | 3 | 5 | **4.55** | S |
| 20 | Paradigm Research | 5 | 5 | 5 | 5 | 2 | 2 | **4.55** | S |
| 24 | Ethereum EIPs | 5 | 4 | 5 | 5 | 2 | 5 | **4.45** | S |
| 24 | MEV-Boost Relay (flashbots) | 5 | 4 | 4 | 5 | 4 | 5 | **4.45** | S |
| 24 | Flashbots Writings | 5 | 5 | 4 | 5 | 2 | 4 | **4.45** | S |
| 27 | Lodestar | 5 | 5 | 2 | 5 | 5 | 5 | **4.40** | S |
| 27 | Forkcast — ACD Call Archive | 4 | 5 | 5 | 4 | 4 | 3 | **4.40** | S |
| 29 | ERC-4337 Account Abstraction | 5 | 4 | 4 | 5 | 3 | 5 | **4.35** | A |
| 30 | Ethereum ERCs | 5 | 4 | 4 | 5 | 2 | 5 | **4.25** | A |
| 30 | Flashbots Collective Forum | 5 | 4 | 4 | 5 | 2 | 5 | **4.25** | A |
| 30 | Rollup Improvement Proposals (RIPs) | 5 | 4 | 4 | 5 | 2 | 5 | **4.25** | A |
| 33 | Jon Charbonneau — Protocol Research | 4 | 5 | 4 | 5 | 1 | 4 | **4.10** | A |
| 34 | Immunefi — Bug Bounty Reports | 4 | 4 | 4 | 4 | 4 | 3 | **3.95** | B |
| 34 | Optimism Collective Governance | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 34 | Arbitrum DAO Forum | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 34 | Uniswap Governance Forum | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 34 | Lido Research Forum | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 34 | ENS DAO Forum | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 34 | EigenLayer Forum | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 34 | Aave Governance Forum | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 34 | Sky (MakerDAO) Forum | 5 | 3 | 4 | 4 | 3 | 5 | **3.95** | B |
| 43 | Ethereum Cat Herders | 4 | 4 | 4 | 4 | 3 | 4 | **3.90** | B |
| 43 | OpenZeppelin Blog | 4 | 4 | 4 | 4 | 3 | 4 | **3.90** | B |
| 45 | Flashbots PM (GitHub) | 4 | 4 | 3 | 5 | 2 | 5 | **3.80** | B |
| 46 | ZK Nation (zkSync) Forum | 5 | 3 | 3 | 4 | 3 | 5 | **3.75** | B |
| 46 | Starknet Community Forum | 5 | 3 | 3 | 4 | 3 | 5 | **3.75** | B |
| 48 | Sigma Prime Blog | 4 | 4 | 3 | 4 | 3 | 4 | **3.70** | B |
| 49 | DefiLlama — Chain TVL | 5 | 3 | 3 | 4 | 2 | 5 | **3.65** | B |
| 49 | DefiLlama — Stablecoin Metrics | 5 | 3 | 3 | 4 | 2 | 5 | **3.65** | B |
| 49 | DefiLlama — DEX Volume | 5 | 3 | 3 | 4 | 2 | 5 | **3.65** | B |
| 52 | Compound Forum | 5 | 2 | 3 | 3 | 3 | 5 | **3.35** | C |
| 52 | Curve Governance Forum | 5 | 2 | 3 | 3 | 3 | 5 | **3.35** | C |
| 54 | Safe Forum | 5 | 2 | 3 | 3 | 2 | 5 | **3.25** | C |
| 54 | Polygon Community Forum | 5 | 2 | 3 | 3 | 2 | 5 | **3.25** | C |
| 56 | Nethermind Blog | 4 | 3 | 3 | 3 | 2 | 4 | **3.20** | C |
| 56 | Ethereum Weekly Digest | 3 | 4 | 3 | 3 | 2 | 4 | **3.20** | C |
| 56 | Lido Finance Blog | 4 | 3 | 3 | 3 | 2 | 4 | **3.20** | C |
| 56 | Offchain Labs (Arbitrum) Blog | 4 | 3 | 3 | 3 | 2 | 4 | **3.20** | C |
| 60 | The Graph Forum | 5 | 2 | 2 | 3 | 2 | 5 | **3.05** | C |
| 60 | Scroll Governance Forum | 5 | 2 | 2 | 3 | 2 | 5 | **3.05** | C |
| 60 | Linea Community Forum | 5 | 2 | 2 | 3 | 2 | 5 | **3.05** | C |
| 60 | Taiko Community Forum | 5 | 2 | 2 | 3 | 2 | 5 | **3.05** | C |
| 64 | Chainlink Blog | 3 | 2 | 3 | 2 | 2 | 4 | **2.55** | D |
| 65 | The Block | 2 | 2 | 2 | 1 | 2 | 4 | **1.95** | D |
| 66 | CryptoPanic — Trending | 1 | 2 | 2 | 1 | 3 | 4 | **1.80** | D |
| 66 | CryptoPanic — Hot | 1 | 2 | 2 | 1 | 3 | 4 | **1.80** | D |
| 68 | CryptoPanic — Rising | 1 | 1 | 1 | 1 | 3 | 4 | **1.35** | D |
| 69 | Crypto News (cryptocurrency.cv) | 1 | 1 | 1 | 1 | 2 | 3 | **1.20** | D |

---

## Score Distribution

```
S tier (4.50–5.00) │███████████████████████████████  29 sources  (42%)
A tier (4.00–4.49) │████████                          5 sources   (7%)
B tier (3.50–3.99) │████████████████████             18 sources  (26%)
C tier (3.00–3.49) │████████████                     10 sources  (15%)
D tier (<3.00)     │████████                          5 sources   (7%)
```

---

## Band Summaries

### S — Foundational (29 sources)

The backbone of the product. These sources either produce primary-record content, have 100% signal density, are the only place to get their content, or are time-critical. Non-negotiable.

Notable callouts:
- **Solidity + Geth** are the only two perfect 5.00 scores — every release is canonical, time-critical, and affects every developer on Ethereum
- **rekt.news and samczsun** both hit 4.85 — their integration reliability drag (custom scrapers) is the only thing keeping them from the top
- **Tim Beiko's ACD notes** on HackMD score 4.75 — reliability drag from the hackmd scraper is the risk to watch
- **Paradigm Research** scores 4.55 despite a reliability score of 2 — content authority and signal are strong enough to overcome the fragile scraper

---

### A — High Value (5 sources)

Strong sources with one or two weaknesses. ERC-4337, ERCs repo, RIPs repo, Flashbots Collective, and Jon Charbonneau all belong in the feed but benefit from quality filtering.

- **Jon Charbonneau** scores lowest on time sensitivity (1) — his research is deep and evergreen, never urgent. Low-priority queue is correct.
- **ERCs repo** and **RIPs repo** have lower impact than EIPs — fewer ERCs have protocol-wide implications.

---

### B — Solid Signal (18 sources)

Contextual signal. These sources matter but have lower signal density or narrower audience reach. The governance forums belong here: they are authoritative primary sources but generate significant proposal noise around occasional high-signal votes.

- **All major L2 + DeFi governance forums** land in B tier. Signal density is the drag — ratio of genuine governance proposals to temperature checks and spam is low.
- **DefiLlama** sources all score 3.65 — high authority and uniqueness, but time sensitivity is low (metrics shift gradually, not suddenly).
- **Immunefi** is the highest-scoring B source (3.95) — stronger signal density and time sensitivity than the governance forums.

---

### C — Marginal (10 sources)

High authority, low signal density, or narrow impact. These sources produce real content but require aggressive quality filtering to be net-positive for the feed.

- **Compound, Curve, Safe, Polygon, The Graph, Scroll, Linea, Taiko** all cluster at 3.05–3.35 — they're canonical governance sources for their ecosystems, but the ecosystems are smaller and governance activity lower quality.
- **Nethermind Blog, Lido Blog, Offchain Labs Blog, Ethereum Weekly Digest** score 3.20 — derivative content that often duplicates what's already in higher-ranked sources.

---

### D — Review for Removal (5 sources)

| Source | Score | Issue |
|---|---|---|
| Chainlink Blog | 2.55 | Low Ethereum specificity. Mostly oracle marketing content. |
| The Block | 1.95 | Pure derivative journalism. Everything it covers is covered better elsewhere. |
| CryptoPanic Trending | 1.80 | Shared upstream pool with Hot — redundant. Mostly non-Ethereum content. |
| CryptoPanic Hot | 1.80 | Marginally better signal than Rising but still low density. |
| CryptoPanic Rising | 1.35 | Nearly all price speculation and non-protocol content. |
| Crypto News (cryptocurrency.cv) | 1.20 | Lowest-scored source. Aggregator of aggregators. No unique content. |

**Recommendation:** Remove `cryptocurrency.cv/news`, `cryptopanic.com/rising`, and `www.theblock.co`. Retain `cryptopanic.com/trending` and `cryptopanic.com/hot` with suppression threshold raised to `0.40` (vs. default `0.25`) to compensate for low baseline signal density.

---

## Integration Reliability Watch List

Sources with reliability score ≤ 2 require active monitoring — a DOM change or API deprecation will silently break the fetch with no HTTP error:

| Source | Score | Reliability | Risk |
|---|---|---|---|
| rekt.news | 4.85 | 2 | HTML scraper. DOM changes break it silently. |
| Paradigm Research | 4.55 | 2 | Custom scraper. No RSS fallback. |
| Tim Beiko ACD Updates | 4.75 | 2 | HackMD scraper. Document structure can shift. |

These three sources collectively represent some of the highest-value content in the feed. Invest in making their scrapers resilient — add monitoring alerts on consecutive fetch failures.

---

## Parameter Averages by Category

| Category | Auth | Signal | Impact | Unique | Time | Rel | Avg Score |
|---|---|---|---|---|---|---|---|
| Core Protocol (T1) | 4.9 | 4.5 | 5.0 | 5.0 | 2.8 | 4.8 | **4.58** |
| Client Releases (T5+T14) | 5.0 | 5.0 | 3.7 | 5.0 | 5.0 | 5.0 | **4.73** |
| Security Blogs | 4.7 | 4.7 | 4.7 | 4.7 | 3.7 | 3.7 | **4.55** |
| Research Blogs | 4.5 | 4.8 | 4.5 | 5.0 | 2.0 | 3.5 | **4.30** |
| L2 Governance | 5.0 | 2.9 | 3.3 | 3.9 | 2.9 | 5.0 | **3.77** |
| DeFi Governance | 5.0 | 2.6 | 3.4 | 3.4 | 2.8 | 5.0 | **3.67** |
| Metrics (DefiLlama) | 5.0 | 3.0 | 3.0 | 4.0 | 2.0 | 5.0 | **3.65** |
| Protocol Blogs (T13) | 3.5 | 2.8 | 2.8 | 2.8 | 2.3 | 3.8 | **3.03** |
| Crypto Aggregators (T7) | 1.0 | 1.5 | 1.5 | 1.0 | 2.8 | 3.8 | **1.69** |

**Key insight:** Client releases punch above their weight — perfect signal density and time sensitivity compensate for narrower category impact. Crypto aggregators are the only category that averages below 2.00 — they should be treated as a separate feed tier with higher suppression thresholds.

---

*Source rankings are reviewed quarterly. Parameter scores are updated when a source's publishing frequency, quality, or integration stability materially changes.*

---

<div align="center">

`[ hexcast ]` &nbsp;·&nbsp; source quality rankings &nbsp;·&nbsp; February 2026

**[hexcast.xyz →](https://hexcast.xyz)**

</div>
