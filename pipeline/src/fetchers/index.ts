import { BaseFetcher } from './base.js';
import { DiscourseFetcher } from './discourse.js';
import { GitHubRepoFetcher } from './github-repo.js';
import { RssFetcher } from './rss.js';
import { HtmlScraperFetcher } from './html-scraper.js';
import { DefiLlamaFetcher } from './defillama.js';
import type { FetcherConfig } from '@ethpulse/shared';

const FETCHER_MAP: Record<string, new (config: FetcherConfig) => BaseFetcher> = {
  discourse: DiscourseFetcher,
  github_api: GitHubRepoFetcher,
  rss: RssFetcher,
  html_scraper: HtmlScraperFetcher,
  rest_api: DefiLlamaFetcher,
};

export function createFetcher(config: FetcherConfig): BaseFetcher {
  const FetcherClass = FETCHER_MAP[config.apiType];
  if (!FetcherClass) {
    throw new Error(`Unknown api_type: ${config.apiType}`);
  }
  return new FetcherClass(config);
}
