import { describe, it, expect, vi } from 'vitest';

// Mock all fetcher modules using class constructors so `new FetcherClass(config)` works
vi.mock('../discourse.js', () => ({
  DiscourseFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../github-repo.js', () => ({
  GitHubRepoFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../rss.js', () => ({
  RssFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../html-scraper.js', () => ({
  HtmlScraperFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../nethermind.js', () => ({
  NethermindFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../defillama.js', () => ({
  DefiLlamaFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../cryptopanic.js', () => ({
  CryptoPanicFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../crypto-news.js', () => ({
  CryptoNewsFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../rekt-news.js', () => ({
  RektNewsFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../paradigm.js', () => ({
  ParadigmFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));
vi.mock('../hackmd.js', () => ({
  HackMdFetcher: class { config: any; constructor(config: any) { this.config = config; } },
}));

import { createFetcher } from '../index.js';

function makeConfig(apiType: string) {
  return {
    sourceId: 'test-source',
    baseUrl: 'https://example.com',
    apiType,
    lastPolledAt: null,
  };
}

describe('createFetcher', () => {
  const knownApiTypes = [
    'discourse',
    'github_api',
    'rss',
    'html_scraper',
    'nethermind_scraper',
    'rest_api',
    'cryptopanic',
    'crypto_news_api',
    'rekt_scraper',
    'paradigm_scraper',
    'hackmd_scraper',
  ];

  it.each(knownApiTypes)('creates a fetcher for apiType "%s"', (apiType) => {
    const config = makeConfig(apiType);
    const fetcher = createFetcher(config);
    expect(fetcher).toBeDefined();
    expect((fetcher as any).config).toEqual(config);
  });

  it('throws for unknown apiType', () => {
    expect(() => createFetcher(makeConfig('nonexistent_type'))).toThrow(
      'Unknown api_type: nonexistent_type',
    );
  });

  it('throws for empty apiType string', () => {
    expect(() => createFetcher(makeConfig(''))).toThrow('Unknown api_type: ');
  });

  it('returns an object (instance of the mocked fetcher class)', () => {
    const fetcher = createFetcher(makeConfig('rss'));
    expect(fetcher).toBeDefined();
    expect(typeof fetcher).toBe('object');
  });

  it('passes the config through to the fetcher constructor', () => {
    const config = makeConfig('discourse');
    const fetcher = createFetcher(config);
    expect((fetcher as any).config).toBe(config);
  });
});
