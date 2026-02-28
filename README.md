# EthPulse

**Ethereum ecosystem intelligence in 60-word cards.**

EthPulse is a free, protocol-level intelligence feed for Ethereum builders and researchers. It monitors 70+ curated sources — from All Core Devs call transcripts to exploit post-mortems to governance votes — and surfaces every significant development as a single, AI-summarized 60-word card. No noise, no price speculation, no newsletter friction.

> Built to fill the gap left by Week in Ethereum News (retired January 2025).

---

## What It Covers

Eight categories of Ethereum-native signal, updated continuously:

| Category | What It Tracks | Example Sources |
|---|---|---|
| **RESEARCH** | Protocol proposals, technical essays, core researcher posts | ethresear.ch, vitalik.eth.limo, Paradigm, Flashbots |
| **EIP / ERC** | New proposals, status changes (Draft → Final), discussion threads | github.com/ethereum/EIPs, ethereum-magicians.org |
| **PROTOCOL CALLS** | All Core Devs call agendas, summaries, action items | forkcast.org, github.com/ethereum/pm, Tim Beiko ACD notes |
| **GOVERNANCE** | DAO proposals, active votes, outcomes | Optimism, Arbitrum, zkSync, Uniswap, Aave, Lido, ENS, Sky |
| **UPGRADE** | Client software releases, testnet activations, hard forks | All 10 Ethereum clients (5 EL + 5 CL) |
| **SECURITY** | Exploit post-mortems, audit publications, vulnerability disclosures | Rekt News, Trail of Bits, samczsun, OpenZeppelin |
| **ANNOUNCEMENT** | Official communications, ecosystem news | Ethereum Foundation Blog, L2 foundation blogs |
| **METRICS** | TVL, staking yield, ETH supply, L2 security stages | DefiLlama, beaconcha.in, ultrasound.money, L2BEAT |

---

## How It Works

```
70+ Sources → Fetch (every 30min–4hrs) → Quality Score → AI Summarize → Personalized Feed
```

1. **Fetch** — Discourse forums, GitHub APIs, RSS feeds, REST APIs, and custom scrapers pull new content on rolling schedules (30 min for client releases, 2 hrs for research, 4 hrs for EIP repos).

2. **Quality Score** — Every item gets a `0.0–1.0` score combining source credibility weight (40%) and content signal strength (60%). Items below `0.25` are auto-suppressed before they ever reach a user.

3. **Summarize** — Claude Haiku generates a factual 60-word summary preserving technical identifiers: EIP numbers, vote percentages, client versions, and author names. Sonnet 4.6 handles complex or lengthy content.

4. **Personalized Feed** — Authenticated users get unseen-first ordering. The feed tracks what you've read and always shows you what you haven't.

---

## Source Coverage

**70+ sources across 12 tiers:**

- **Core Protocol** — ethresear.ch, Ethereum Magicians, EIPs, ERCs, ACD PM, Forkcast, EF Blog, Vitalik
- **Community Intelligence** — Ethereum Cat Herders, Christine Kim (ACDC Notes), Ethereum Weekly Digest
- **L2 Governance** — Optimism, Arbitrum, zkSync, Starknet, Uniswap, Scroll, Polygon, Linea, Taiko
- **DeFi Governance** — Aave, Lido, Compound, Curve, ENS, EigenLayer, The Graph, Safe, Sky (MakerDAO)
- **MEV / PBS** — Flashbots Collective, Flashbots PM, MEV-Boost Relay
- **Client Releases** — Geth, Nethermind, Besu, Reth, Erigon, Lighthouse, Prysm, Teku, Nimbus, Lodestar
- **Research Blogs** — Paradigm, Flashbots Writings, Jon Charbonneau, samczsun, Nethermind Blog
- **Security** — Rekt News, Trail of Bits, OpenZeppelin
- **Standards** — RIPs, ERC-4337 / Account Abstraction, Foundry
- **Metrics** — DefiLlama (stablecoins, TVL, DEX volume)
- **Protocol Coordination** — Tim Beiko ACD Updates (HackMD)
- **Crypto Signals** — CryptoPanic (trending/hot/rising)

Full source list and reliability ratings: [SOURCES.md](./SOURCES.md)

---

## Features

**For users:**
- Vertically scrollable card feed (Inshorts-style)
- 8-category filter tabs
- Unseen-first ordering for authenticated users
- Save cards to a reading list (works offline)
- Share cards via native OS share sheet
- Flag inaccurate cards for review
- Installable PWA — works like a native app on iOS and Android

**For the ecosystem:**
- Zero paywall, zero email required to read
- Source attribution on every card
- Links to original source always present
- Full-text summaries preserved for search and archiving
- Open source (MIT license)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend API | Next.js Route Handlers |
| Database | Supabase (PostgreSQL 15) |
| Auth | Clerk |
| Pipeline | Bun + TypeScript + GitHub Actions cron |
| AI Summarization | Claude Haiku 4.5 (routine) / Claude Sonnet 4.6 (complex) |
| Analytics | PostHog |
| PWA | next-pwa + Workbox |

---

## Operating Cost

EthPulse runs on free tiers across all infrastructure components:

| Service | Cost |
|---|---|
| Vercel (hosting) | $0 |
| Supabase (database) | $0 |
| GitHub Actions (pipeline cron) | $0 |
| Anthropic API (Claude summarization) | ~$1–5/month |
| Resend (email) | $0 |
| PostHog (analytics) | $0 |
| **Total** | **~$2–7/month** |

Stays under $10/month until ~50,000 MAU.

---

## Contributing

**Suggest a new source:**
Open an issue with the source URL, why it belongs in EthPulse, and which category it fits. Sources are evaluated against these criteria:
- Publishes Ethereum-native content (not general crypto price news)
- Has machine-readable access (RSS, public API, Discourse `/latest.json`, or structured HTML)
- Published within the last 90 days
- Meets reliability threshold (3/5 or above per [SOURCES.md](./SOURCES.md) criteria)

**Improve source coverage:**
Pull requests to [packages/shared/src/constants/sources.ts](./packages/shared/src/constants/sources.ts) are welcome. Each source entry requires: `id`, `display_name`, `base_url`, `api_type`, `poll_interval_s`, `default_category`.

**Report inaccurate summaries:**
Use the flag button on any card, or open a GitHub issue with the card URL and the specific inaccuracy.

---

## Accuracy

Target: **97% factual accuracy** on weekly random sample audits.

- Word count validated (58–62 words) with up to 3 LLM retries
- Entity preservation checked: EIP numbers, vote percentages, version strings, author names
- All flagged cards reviewed within 24 hours
- Cards confirmed inaccurate are removed and re-processed
- Pipeline suspended if accuracy drops below 95%

---

## License

MIT — [LICENSE](./LICENSE)

---

*EthPulse — February 2026*
