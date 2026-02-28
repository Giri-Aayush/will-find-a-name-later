import * as cheerio from 'cheerio';
import { BaseFetcher } from './base.js';
import type { FetchResult } from '@ethpulse/shared';
import { logger } from '../utils/logger.js';

/**
 * Scraper for Tim Beiko's ACD Updates index on HackMD.
 *
 * The index page (hackmd.io/@timbeiko/acd) contains links to individual
 * update notes hosted on Mirror.xyz and HackMD. We extract those links,
 * then fetch each one for content.
 */
export class HackMdFetcher extends BaseFetcher {
  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    try {
      const response = await fetch(this.config.baseUrl, {
        headers: { 'User-Agent': 'EthPulse/1.0 (news aggregator)' },
      });

      if (!response.ok) {
        logger.warn(`hackmd.io returned ${response.status}`);
        return [];
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract all links from the markdown content
      const links: { title: string; url: string }[] = [];

      // HackMD renders markdown in a .markdown-body or #doc container
      const contentArea = $('#doc, .markdown-body, .content').first();
      const container = contentArea.length ? contentArea : $('body');

      container.find('a').each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href');
        const text = $a.text().trim();

        if (!href || !text) return;

        // Only grab ACD update links (Mirror or HackMD)
        const isUpdate =
          text.toLowerCase().includes('update') ||
          href.includes('mirror.xyz') ||
          href.includes('hackmd.io/@timbeiko/acd-update');

        if (isUpdate && (href.includes('mirror.xyz') || href.includes('hackmd.io'))) {
          links.push({ title: text, url: href });
        }
      });

      // Fetch each update page for content (only new ones since last poll)
      const MAX_ITEMS = 5; // Tim posts infrequently, limit fetches per run
      let count = 0;

      for (const link of links) {
        if (count >= MAX_ITEMS) break;

        try {
          const pageRes = await fetch(link.url, {
            headers: { 'User-Agent': 'EthPulse/1.0 (news aggregator)' },
            redirect: 'follow',
          });

          if (!pageRes.ok) continue;

          const pageHtml = await pageRes.text();
          const page$ = cheerio.load(pageHtml);

          // Remove non-content elements
          page$('script, style, nav, header, footer').remove();

          // Extract text from content area
          const contentEl = page$('article, .markdown-body, #doc, main, .content').first();
          const text = contentEl.length ? contentEl.text() : page$('body').text();
          const cleanText = text.replace(/\s+/g, ' ').trim();

          if (cleanText.length < 50) continue;

          count++;

          results.push({
            sourceId: this.config.sourceId,
            canonicalUrl: link.url,
            rawTitle: link.title,
            rawText: cleanText.slice(0, 10000), // Cap text length
            rawMetadata: { author: 'Tim Beiko' },
            publishedAt: null, // No reliable date from the index page
          });
        } catch {
          logger.warn(`Failed to fetch ACD update: ${link.url}`);
        }
      }

      logger.info(`hackmd.io/@timbeiko: ${results.length} ACD updates`);
    } catch (error) {
      logger.error('Failed to scrape HackMD ACD index:', error);
    }

    return results;
  }
}
