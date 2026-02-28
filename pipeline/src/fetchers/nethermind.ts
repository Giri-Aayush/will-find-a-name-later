import * as cheerio from 'cheerio';
import { BaseFetcher } from './base.js';
import type { FetchResult } from '@hexcast/shared';
import { logger } from '../utils/logger.js';

/**
 * Scraper for www.nethermind.io/blog — Webflow CMS blog.
 *
 * HTML structure: Webflow CMS with `w-dyn-item` collection items.
 * Featured items use `h3.h4-medium-exo-31px`, regular items use `h5`.
 * Dates are in `.date_new` elements (e.g. "February 18, 2026").
 * Article URLs: https://www.nethermind.io/blog/{slug}
 */
export class NethermindFetcher extends BaseFetcher {
  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    try {
      const response = await fetch(`${this.config.baseUrl}/blog`, {
        headers: { 'User-Agent': 'Hexcast/1.0 (news aggregator)' },
      });

      if (!response.ok) {
        logger.warn(`nethermind.io returned ${response.status}`);
        return [];
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const seen = new Set<string>();
      const MAX_ITEMS = 30;

      $('[role="listitem"].w-dyn-item').each((_, el) => {
        if (results.length >= MAX_ITEMS) return false;

        const $el = $(el);
        const link = $el.find('a[href^="/blog/"]').first();
        const href = link.attr('href');
        if (!href) return;

        const url = new URL(href, this.config.baseUrl).toString();
        if (seen.has(url)) return;
        seen.add(url);

        // Title: featured items use h3, regular items use h5
        const title =
          $el.find('h3').first().text().trim() ||
          $el.find('h5').first().text().trim();
        if (!title) return;

        // Date in .date_new (with or without .spacing class)
        const dateText = $el.find('.date_new').first().text().trim();
        const pubDate = dateText ? new Date(dateText) : null;

        if (!this.isAfterLastPoll(pubDate)) return;

        // Summary (only on featured items)
        const summary = $el.find('.body-regular-18x').first().text().trim() || null;

        // Category tag
        const category = $el.find('.tag_gradient, .feature_tag').first().text().trim() || null;

        results.push({
          sourceId: this.config.sourceId,
          canonicalUrl: url,
          rawTitle: title,
          rawText: summary,
          rawMetadata: { category },
          publishedAt: pubDate,
        });
      });

      logger.info(`nethermind.io/blog: ${results.length} new articles`);
    } catch (error) {
      logger.error('Failed to scrape nethermind.io/blog:', error);
    }

    return results;
  }
}
