import { BaseFetcher } from './base.js';
import type { FetchResult } from '@hexcast/shared';
import { loadConfig } from '../config.js';
import { logger } from '../utils/logger.js';

interface GitHubPull {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  user: { login: string } | null;
  labels: Array<{ name: string }>;
  created_at: string;
  merged_at: string | null;
  updated_at: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  user: { login: string } | null;
  labels: Array<{ name: string }>;
  created_at: string;
  updated_at: string;
  pull_request?: unknown;
}

function parseGitHubRepo(baseUrl: string): { owner: string; repo: string } {
  const url = new URL(baseUrl);
  const parts = url.pathname.split('/').filter(Boolean);
  return { owner: parts[0], repo: parts[1] };
}

// ── EIP/ERC PR filtering ─────────────────────────────────────────────────
// Only surface meaningful EIP/ERC activity: new proposals and merges to main.
// Filter out bot-authored PRs and maintenance/CI noise.
//
// Real PR title patterns from ethereum/EIPs and ethereum/ERCs repos:
//   "Add ERC: Crosschain Token Interface"         — new proposal (no number yet)
//   "Add EIP: Cell-Level Deltas for..."            — new proposal (no number yet)
//   "Update ERC-7425: Clarify Language"            — content/status update
//   "Move ERC-7893: Move to Final"                 — status change
//   "ERC: Account Abstraction via..."              — new without "Add" prefix
//   "CI: Update ci.yml"                            — infrastructure noise
//   "Config: Fix merge-repos race condition"       — infrastructure noise
//   "Website: sync with EIPs"                      — infrastructure noise

/** @internal Exported for testing */
export function isBotAuthor(login: string | null): boolean {
  if (!login) return false;
  if (login.endsWith('[bot]')) return true;
  const known = new Set([
    'eth-bot', 'ethereum-push-bot', 'eip-review-bot',
    'eip-automerger', 'merge-script',
  ]);
  return known.has(login.toLowerCase());
}

// Whitelist: PR titles that represent meaningful EIP/ERC activity
const SIGNIFICANT_PATTERNS = [
  /^Add (EIP|ERC)/i,             // New proposal: "Add ERC: Title" or "Add ERC-1234: Title"
  /^Update (EIP|ERC)-\d+/i,     // Content/status update with specific number
  /^Move (EIP|ERC)-\d+/i,       // Status change: "Move ERC-7425 to Review"
  /^(EIP|ERC)-\d+/i,            // Direct reference: "ERC-7425: ..."
  /^(EIP|ERC): /i,              // New without number: "ERC: Account Abstraction..."
];

/** @internal Exported for testing */
export function isSignificantEipPR(title: string, author: string | null): boolean {
  if (isBotAuthor(author)) return false;
  return SIGNIFICANT_PATTERNS.some((p) => p.test(title));
}

export class GitHubRepoFetcher extends BaseFetcher {
  private get headers(): Record<string, string> {
    const config = loadConfig();
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (config.githubPat) {
      headers['Authorization'] = `Bearer ${config.githubPat}`;
    }
    return headers;
  }

  async fetch(): Promise<FetchResult[]> {
    const { owner, repo } = parseGitHubRepo(this.config.baseUrl);

    // ethereum/pm uses issues (call agendas), EIPs/ERCs use pulls (status changes)
    if (repo === 'pm') {
      return this.fetchIssues(owner, repo);
    }

    // EIPs/ERCs: fetch both merged PRs and new proposals
    const [merged, proposals] = await Promise.all([
      this.fetchMergedPulls(owner, repo),
      this.fetchNewProposals(owner, repo),
    ]);

    // Deduplicate by URL (a PR could appear in both if opened and merged in same poll window)
    const seen = new Set<string>();
    const results: FetchResult[] = [];
    for (const item of [...merged, ...proposals]) {
      if (!seen.has(item.canonicalUrl)) {
        seen.add(item.canonicalUrl);
        results.push(item);
      }
    }

    return results;
  }

  /** Fetch recently merged PRs that introduce or update a specific EIP/ERC */
  private async fetchMergedPulls(owner: string, repo: string): Promise<FetchResult[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=30`;

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      logger.error(`GitHub API error for ${owner}/${repo} pulls: ${response.status}`);
      return [];
    }

    const pulls = (await response.json()) as GitHubPull[];
    const results: FetchResult[] = [];
    let filtered = 0;

    for (const pr of pulls) {
      if (!pr.merged_at) continue;

      const mergedAt = new Date(pr.merged_at);
      if (!this.isAfterLastPoll(mergedAt)) continue;

      // Only include PRs that reference a specific EIP/ERC and aren't bot noise
      if (!isSignificantEipPR(pr.title, pr.user?.login ?? null)) {
        filtered++;
        continue;
      }

      results.push({
        sourceId: this.config.sourceId,
        canonicalUrl: pr.html_url,
        rawTitle: pr.title,
        rawText: pr.body,
        rawMetadata: {
          number: pr.number,
          author: pr.user?.login ?? null,
          labels: pr.labels.map((l) => l.name),
          merged_at: pr.merged_at,
          type: 'pull_request',
        },
        publishedAt: mergedAt,
      });
    }

    if (filtered > 0) {
      logger.info(`${this.config.sourceId}: filtered out ${filtered} bot/noise merged PRs`);
    }
    logger.info(`${this.config.sourceId}: ${results.length} significant merged PRs`);
    return results;
  }

  /** Fetch recently opened PRs that propose a new EIP/ERC (Add EIP-XXXX / Add ERC-XXXX) */
  private async fetchNewProposals(owner: string, repo: string): Promise<FetchResult[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&sort=created&direction=desc&per_page=15`;

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      logger.error(`GitHub API error for ${owner}/${repo} new proposals: ${response.status}`);
      return [];
    }

    const pulls = (await response.json()) as GitHubPull[];
    const results: FetchResult[] = [];
    // Match "Add ERC: Title", "Add ERC-1234: Title", "Add EIP: Title", "ERC: Title"
    const newProposalPattern = /^(add )?(eip|erc)[\s:\-]/i;

    for (const pr of pulls) {
      const createdAt = new Date(pr.created_at);
      if (!this.isAfterLastPoll(createdAt)) continue;

      // Only include genuinely new proposals
      if (isBotAuthor(pr.user?.login ?? null)) continue;
      if (!newProposalPattern.test(pr.title)) continue;

      results.push({
        sourceId: this.config.sourceId,
        canonicalUrl: pr.html_url,
        rawTitle: `[New Proposal] ${pr.title}`,
        rawText: pr.body,
        rawMetadata: {
          number: pr.number,
          author: pr.user?.login ?? null,
          labels: pr.labels.map((l) => l.name),
          type: 'new_proposal',
        },
        publishedAt: createdAt,
      });
    }

    logger.info(`${this.config.sourceId}: ${results.length} new EIP/ERC proposals`);
    return results;
  }

  private async fetchIssues(owner: string, repo: string): Promise<FetchResult[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?sort=created&direction=desc&per_page=30&state=all`;

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      logger.error(`GitHub API error for ${owner}/${repo} issues: ${response.status}`);
      return [];
    }

    const issues = (await response.json()) as GitHubIssue[];
    const results: FetchResult[] = [];

    for (const issue of issues) {
      // Skip pull requests that show up in the issues endpoint
      if (issue.pull_request) continue;

      const createdAt = new Date(issue.created_at);
      if (!this.isAfterLastPoll(createdAt)) continue;

      results.push({
        sourceId: this.config.sourceId,
        canonicalUrl: issue.html_url,
        rawTitle: issue.title,
        rawText: issue.body,
        rawMetadata: {
          number: issue.number,
          author: issue.user?.login ?? null,
          labels: issue.labels.map((l) => l.name),
          type: 'issue',
        },
        publishedAt: createdAt,
      });
    }

    logger.info(`${this.config.sourceId}: ${results.length} new issues`);
    return results;
  }
}
