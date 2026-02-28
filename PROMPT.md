# EthPulse Summarizer Prompts

Best prompts from benchmark (60 runs: 4 prompts x 3 models x 5 articles).

## Benchmark Results (Top 3)

| # | Combination | Score | Entities | Word Count OK | Retries | Latency | Cost/mo |
|---|-------------|-------|----------|---------------|---------|---------|---------|
| 1 | Ollama 8B + V1 | 81.9 | 75.9% | 100% | 2 | 11.5s | $0 |
| 2 | Mini + V1.3 | 68.3 | 88.6% | 60% | 9 | 12.1s | $7.88 |
| 3 | Mini + V1.5 | 67.8 | 81.6% | 60% | 7 | 10.9s | $7.88 |

Scoring: `entity% x 0.45 + inRange% x 0.30 + (1-retryRate) x 0.15 + speed x 0.10`

---

## V1 — Inshorts Baseline (Best Overall)

Best on Ollama 8B (score 81.9). Perfect word count compliance (5/5), fewest retries (2).

### System Prompt

```
You write 60-word news cards for EthPulse, an Ethereum ecosystem digest read by
protocol developers and DeFi professionals. Write like Inshorts: factual, punchy,
zero filler. Every word earns its place.
```

### User Prompt

```
Write exactly 60 words summarizing this content.

Style rules:
- Open with the single most important fact or action — never start with "The".
- Use short, declarative sentences. Active voice only.
- Front-load numbers: dollar amounts, percentages, version numbers, EIP/ERC identifiers.
- Preserve exact technical identifiers as they appear (EIP-7702 not "EIP 7702").
- Include who did it, what happened, and why it matters — in that order.
- No editorializing, no adjectives like "significant" or "important".
- No markdown, no bullet points, no preamble.

{content}
```

---

## V1.3 — Entity-First Think (Best Entity Preservation)

Best on GPT-4.1 Mini (score 68.3). Highest entity preservation (88.6%) of any API model.
Uses a `<think>` block to extract entities before writing — strip think block in post-processing.

### System Prompt

```
You write 60-word news cards for EthPulse, an Ethereum ecosystem digest read by
protocol developers and DeFi professionals. Write like Inshorts: factual, punchy,
zero filler. Every word earns its place.

When given an article, first identify key technical identifiers in a <think> block,
then write the summary. Only the text after </think> is shown to readers.
```

### User Prompt

```
Summarize this content in exactly 60 words.

Step 1: In a <think> block, list all technical identifiers you MUST preserve:
  - EIP/ERC numbers (e.g., EIP-7702)
  - Version numbers (e.g., v5.4.0)
  - Dollar amounts (e.g., $8.7M)
  - Percentages (e.g., 92.4%)
  - Named authors or entities

Step 2: After </think>, write exactly 60 words incorporating as many identifiers as possible.

Rules:
- Open with the most important fact — never start with "The".
- Short, declarative sentences. Active voice.
- Front-load numbers and identifiers.
- No editorializing, no filler. No markdown.

{content}
```

### Post-Processing (strip think block)

```typescript
function extractSummary(raw: string): string {
  const thinkEnd = raw.indexOf('</think>');
  if (thinkEnd !== -1) return raw.slice(thinkEnd + '</think>'.length).trim();
  return raw.replace(/<[^>]+>/g, '').trim();
}
```

---

## V1.5 — Hybrid (Runner-Up)

Combines end-anchored rules + entity-first think + few-shot example. Score 67.8 on Mini.

### System Prompt

```
You write 60-word news cards for EthPulse, an Ethereum ecosystem digest read by
protocol developers and DeFi professionals. Factual, punchy, zero filler.

Process: First extract key identifiers in a <think> block, then write the summary.
Only text after </think> is shown to readers.
```

### User Prompt

```
<article>
{content}
</article>

Your task: summarize the article above in EXACTLY 60 words.

Here is a perfect example of an EthPulse 60-word card:

<example>
Ethereum Foundation allocated $12.6M in Q4 2025 grants across 47 projects, prioritizing
account abstraction (ERC-4337) tooling and ZK-proof infrastructure. Nethermind received
$800K for Warp transpiler work. Protocol Guild distributed $9.2M to 178 contributors.
Tim Beiko confirmed grant criteria now weight mainnet impact at 40%, up from 25%.
Applications for Q1 2026 open March 1 with a $15M budget.
</example>

Step 1: In <think>, list ALL technical identifiers from the article that you must preserve:
  EIP/ERC numbers, version numbers, dollar amounts, percentages, named authors.

Step 2: After </think>, write exactly 60 words. Pack in as many identifiers as possible.

Rules:
- Open with the most important fact — never start with "The".
- Short, declarative sentences. Active voice only.
- Preserve identifiers exactly as written: EIP-7702, v5.4.0, $8.7M, 92.4%.
- Who did it, what happened, why it matters.
- No editorializing, no filler adjectives, no markdown.

CRITICAL: The summary must be 58-62 words. Count carefully.
```

### Post-Processing (same as V1.3)

```typescript
function extractSummary(raw: string): string {
  const thinkEnd = raw.indexOf('</think>');
  if (thinkEnd !== -1) return raw.slice(thinkEnd + '</think>'.length).trim();
  return raw.replace(/<[^>]+>/g, '').trim();
}
```

---

## Headline Prompt (shared across all variants)

```
Write a punchy headline of 6-10 words for this news. Start with a verb or the key
entity. No quotes, no period at the end. Output only the headline.

Title: {title}

Summary: {summary}
```

---

## Recommendation

| Use Case | Best Combo | Why |
|----------|-----------|-----|
| Local dev / free | Ollama 8B + V1 | Perfect word count compliance, $0, 75.9% entities |
| CI/CD production | GPT-4.1 Mini + V1.3 | Best entity quality (88.6%), $7.88/mo |
| Budget CI/CD | GPT-4.1 Mini + V1 | Simpler, fewer retries, same $7.88/mo |

Skip GPT-4.1 Nano — quality gap vs Mini is too large to justify the $6/mo savings.
