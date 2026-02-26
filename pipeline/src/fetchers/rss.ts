import RssParser from 'rss-parser';
import * as cheerio from 'cheerio';
import { BaseFetcher } from './base.js';
import type { FetchResult } from '@ethpulse/shared';
import { logger } from '../utils/logger.js';

const parser = new RssParser();

const CONTENT_SELECTORS: Record<string, string> = {
  'blog.ethereum.org': 'article, .post-content, main',
  'vitalik.eth.limo': '.post-content, article, main',
};

// RSS/Atom feed URLs for each source
const RSS_FEEDS: Record<string, string> = {
  // Tier 1
  'blog.ethereum.org': 'https://blog.ethereum.org/feed.xml',
  'vitalik.eth.limo': 'https://vitalik.eth.limo/feed.xml',
  // Tier 2 — Community newsletters
  'medium.com/ethereum-cat-herders': 'https://medium.com/feed/ethereum-cat-herders',
  'weekinethereum.substack.com': 'https://weekinethereum.substack.com/feed',
  'christinedkim.substack.com': 'https://christinedkim.substack.com/feed',
  'ethereumweeklydigest.substack.com': 'https://ethereumweeklydigest.substack.com/feed',
  // Tier 5 — Client release Atom feeds
  'github.com/ethereum/go-ethereum': 'https://github.com/ethereum/go-ethereum/releases.atom',
  'github.com/NethermindEth/nethermind': 'https://github.com/NethermindEth/nethermind/releases.atom',
  'github.com/hyperledger/besu': 'https://github.com/hyperledger/besu/releases.atom',
  'github.com/paradigmxyz/reth': 'https://github.com/paradigmxyz/reth/releases.atom',
  'github.com/erigontech/erigon': 'https://github.com/erigontech/erigon/releases.atom',
  'github.com/sigp/lighthouse': 'https://github.com/sigp/lighthouse/releases.atom',
  'github.com/OffchainLabs/prysm': 'https://github.com/OffchainLabs/prysm/releases.atom',
  'github.com/ConsenSys/teku': 'https://github.com/ConsenSys/teku/releases.atom',
  'github.com/status-im/nimbus-eth2': 'https://github.com/status-im/nimbus-eth2/releases.atom',
  'github.com/ChainSafe/lodestar': 'https://github.com/ChainSafe/lodestar/releases.atom',
};

// Sources that need full article scraping (feeds with only excerpts)
const SCRAPE_SOURCES = new Set([
  'blog.ethereum.org',
  'vitalik.eth.limo',
]);

export class RssFetcher extends BaseFetcher {
  async fetch(): Promise<FetchResult[]> {
    const feedUrl = RSS_FEEDS[this.config.sourceId];
    if (!feedUrl) {
      logger.warn(`No RSS feed URL configured for ${this.config.sourceId}`);
      return [];
    }

    logger.debug(`Fetching RSS feed: ${feedUrl}`);

    const feed = await parser.parseURL(feedUrl);
    const results: FetchResult[] = [];

    const MAX_ITEMS_PER_FETCH = 30;
    let count = 0;

    for (const item of feed.items) {
      if (count >= MAX_ITEMS_PER_FETCH) break;

      const pubDate = item.pubDate
        ? new Date(item.pubDate)
        : item.isoDate
          ? new Date(item.isoDate)
          : null;
      if (!this.isAfterLastPoll(pubDate)) continue;

      let link = item.link;
      if (!link) continue;

      // Vitalik's RSS feed links to vitalik.ca which doesn't resolve
      if (link.includes('vitalik.ca')) {
        link = link.replace('https://vitalik.ca', 'https://vitalik.eth.limo');
      }

      // For sources that need scraping, fetch full article; otherwise use feed content
      let fullText: string | null;
      if (SCRAPE_SOURCES.has(this.config.sourceId)) {
        fullText = await this.scrapeArticle(link);
      } else {
        // Use content from feed (Substack, Medium, GitHub releases include full content)
        fullText = item.contentSnippet
          ?? item['content:encoded']
          ?? item.content
          ?? item.summary
          ?? null;
      }

      count++;

      results.push({
        sourceId: this.config.sourceId,
        canonicalUrl: link,
        rawTitle: item.title ?? null,
        rawText: fullText,
        rawMetadata: {
          guid: item.guid ?? item.id ?? null,
          author: item.creator ?? item['dc:creator'] ?? null,
          categories: item.categories ?? [],
        },
        publishedAt: pubDate,
      });
    }

    logger.info(`${this.config.sourceId}: ${results.length} new RSS items`);
    return results;
  }

  private async scrapeArticle(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        logger.warn(`Failed to scrape article ${url}: ${response.status}`);
        return null;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style, nav, header, footer').remove();

      // Try source-specific selectors first, then fall back to generic
      const selector = CONTENT_SELECTORS[this.config.sourceId] ?? 'article, main, .content';
      let text = $(selector).first().text();

      if (!text || text.length < 100) {
        text = $('body').text();
      }

      return text.replace(/\s+/g, ' ').trim() || null;
    } catch (error) {
      logger.warn(`Error scraping ${url}:`, error);
      return null;
    }
  }
}
