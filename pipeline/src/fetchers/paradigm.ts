import * as cheerio from 'cheerio';
import { BaseFetcher } from './base.js';
import type { FetchResult } from '@ethpulse/shared';
import { logger } from '../utils/logger.js';

interface ParadigmPost {
  title?: string;
  slug?: string;
  publishDatetime?: string;
  summary?: string;
  authors?: Array<{ name?: string }>;
}

/**
 * Scraper for paradigm.xyz/writing — VC research blog.
 *
 * Article data is embedded as JSON in `<script id="__NEXT_DATA__">`.
 * Each post has: title, slug, publishDatetime, summary, authors[].
 * Article URLs: https://www.paradigm.xyz/{slug}
 */
export class ParadigmFetcher extends BaseFetcher {
  async fetch(): Promise<FetchResult[]> {
    const results: FetchResult[] = [];

    try {
      const response = await fetch(`${this.config.baseUrl}/writing`, {
        headers: { 'User-Agent': 'EthPulse/1.0 (news aggregator)' },
      });

      if (!response.ok) {
        logger.warn(`paradigm.xyz returned ${response.status}`);
        return [];
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const nextDataScript = $('script#__NEXT_DATA__').html();
      if (!nextDataScript) {
        logger.warn('paradigm.xyz: no __NEXT_DATA__ script found');
        return [];
      }

      const nextData = JSON.parse(nextDataScript);

      // Navigate the Next.js props to find the posts array
      const posts = this.extractPosts(nextData);
      if (!posts || posts.length === 0) {
        logger.warn('paradigm.xyz: no posts found in __NEXT_DATA__');
        return [];
      }

      const MAX_ITEMS = 30;
      let count = 0;

      for (const post of posts as ParadigmPost[]) {
        if (count >= MAX_ITEMS) break;

        const pubDate = post.publishDatetime ? new Date(post.publishDatetime) : null;
        if (!this.isAfterLastPoll(pubDate)) continue;

        const slug = post.slug;
        if (!slug) continue;

        const url = `https://www.paradigm.xyz/${slug}`;
        const authors = (post.authors ?? [])
          .map((a) => a.name)
          .filter(Boolean)
          .join(', ');

        count++;

        results.push({
          sourceId: this.config.sourceId,
          canonicalUrl: url,
          rawTitle: post.title ?? null,
          rawText: post.summary ?? null,
          rawMetadata: { authors, slug },
          publishedAt: pubDate,
        });
      }

      logger.info(`paradigm.xyz: ${results.length} new articles`);
    } catch (error) {
      logger.error('Failed to scrape paradigm.xyz:', error);
    }

    return results;
  }

  private extractPosts(nextData: Record<string, unknown>): Array<Record<string, unknown>> {
    try {
      // Next.js page props structure: props.pageProps.allPosts or similar
      const pageProps = (nextData as any)?.props?.pageProps;
      if (!pageProps) return [];

      // Try common key names
      for (const key of ['allPosts', 'posts', 'articles', 'writings']) {
        if (Array.isArray(pageProps[key])) return pageProps[key];
      }

      // Fallback: find the first array in pageProps that looks like posts
      for (const value of Object.values(pageProps)) {
        if (Array.isArray(value) && value.length > 0 && value[0]?.title && value[0]?.slug) {
          return value as Array<Record<string, unknown>>;
        }
      }

      return [];
    } catch {
      return [];
    }
  }
}
