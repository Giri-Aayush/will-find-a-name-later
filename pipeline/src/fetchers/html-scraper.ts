import { BaseFetcher } from './base.js';
import type { FetchResult } from '@ethpulse/shared';
import { logger } from '../utils/logger.js';

/**
 * Stub fetcher for Forkcast.org.
 *
 * Forkcast is a client-rendered SPA with no documented API or RSS feed.
 * ACD call content is partially covered by the ethereum/pm GitHub source.
 * Real implementation deferred pending API access from Forkcast maintainers.
 */
export class HtmlScraperFetcher extends BaseFetcher {
  async fetch(): Promise<FetchResult[]> {
    logger.warn(
      `${this.config.sourceId}: HTML scraper is a stub — no API available. ` +
      `Skipping. ACD call content covered by ethereum/pm source.`
    );
    return [];
  }
}
