import { BaseFetcher } from './base.js';
import { DiscourseFetcher } from './discourse.js';
import { GitHubRepoFetcher } from './github-repo.js';
import { RssFetcher } from './rss.js';
import { HtmlScraperFetcher } from './html-scraper.js';
import { NethermindFetcher } from './nethermind.js';
import { DefiLlamaFetcher } from './defillama.js';
import { CryptoPanicFetcher } from './cryptopanic.js';
import { CryptoNewsFetcher } from './crypto-news.js';
import { RektNewsFetcher } from './rekt-news.js';
import { ParadigmFetcher } from './paradigm.js';
import { HackMdFetcher } from './hackmd.js';
import type { FetcherConfig } from '@hexcast/shared';

const FETCHER_MAP: Record<string, new (config: FetcherConfig) => BaseFetcher> = {
  discourse: DiscourseFetcher,
  github_api: GitHubRepoFetcher,
  rss: RssFetcher,
  html_scraper: HtmlScraperFetcher,
  nethermind_scraper: NethermindFetcher,
  rest_api: DefiLlamaFetcher,
  cryptopanic: CryptoPanicFetcher,
  crypto_news_api: CryptoNewsFetcher,
  rekt_scraper: RektNewsFetcher,
  paradigm_scraper: ParadigmFetcher,
  hackmd_scraper: HackMdFetcher,
};

export function createFetcher(config: FetcherConfig): BaseFetcher {
  const FetcherClass = FETCHER_MAP[config.apiType];
  if (!FetcherClass) {
    throw new Error(`Unknown api_type: ${config.apiType}`);
  }
  return new FetcherClass(config);
}
