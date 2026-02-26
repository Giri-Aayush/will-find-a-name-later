import { BaseFetcher } from './base.js';
import type { FetchResult } from '@ethpulse/shared';
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
    return this.fetchPulls(owner, repo);
  }

  private async fetchPulls(owner: string, repo: string): Promise<FetchResult[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=30`;

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      logger.error(`GitHub API error for ${owner}/${repo} pulls: ${response.status}`);
      return [];
    }

    const pulls = (await response.json()) as GitHubPull[];
    const results: FetchResult[] = [];

    for (const pr of pulls) {
      if (!pr.merged_at) continue;

      const mergedAt = new Date(pr.merged_at);
      if (!this.isAfterLastPoll(mergedAt)) continue;

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

    logger.info(`${this.config.sourceId}: ${results.length} new merged PRs`);
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
