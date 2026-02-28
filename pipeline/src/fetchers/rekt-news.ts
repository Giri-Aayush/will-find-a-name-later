import * as cheerio from 'cheerio';
import { BaseFetcher } from './base.js';
import type { FetchResult } from '@hexcast/shared';
import { logger } from '../utils/logger.js';

/**
 * Scraper for rekt.news — DeFi exploit post-mortems.
 *
 * HTML structure: Server-rendered Next.js with clean `article.post` elements.
 * Pagination: `/?page=N` (0-indexed).
 * Only fetches page 0 (latest ~10 articles) since we poll every few hours.
 */
export class RektNewsFetcher extends BaseFetcher {
  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    try {
      const response = await fetch(this.config.baseUrl, {
        headers: { 'User-Agent': 'Hexcast/1.0 (news aggregator)' },
      });

      if (!response.ok) {
        logger.warn(`rekt.news returned ${response.status}`);
        return [];
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $('article.post').each((_, el) => {
        const $el = $(el);
        const titleLink = $el.find('.post-title a, h5 a').first();
        const title = titleLink.text().trim();
        const href = titleLink.attr('href');
        if (!title || !href) return;

        const url = new URL(href, this.config.baseUrl).toString();
        const timeText = $el.find('.post-meta time').text().trim();
        const pubDate = timeText ? new Date(timeText) : null;

        if (!this.isAfterLastPoll(pubDate)) return;

        const excerpt = $el.find('.post-excerpt > p:first-child').text().trim();
        const tags = $el.find('.post-meta p span a').map((_, a) => $(a).text().trim()).get();

        results.push({
          sourceId: this.config.sourceId,
          canonicalUrl: url,
          rawTitle: title,
          rawText: excerpt || null,
          rawMetadata: { tags },
          publishedAt: pubDate,
        });
      });

      logger.info(`rekt.news: ${results.length} new articles`);
    } catch (error) {
      logger.error('Failed to scrape rekt.news:', error);
    }

    return results;
  }
}
