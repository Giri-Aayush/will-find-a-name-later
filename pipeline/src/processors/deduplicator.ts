import { hashUrl } from '../utils/hash.js';
import { isSimilar } from '../utils/levenshtein.js';
import { findByUrlHash, findByTimeRange } from '../db/cards.js';
import { logger } from '../utils/logger.js';

export async function isDuplicate(
  canonicalUrl: string,
  title: string,
  publishedAt: Date
): Promise<boolean> {
  // Stage 1: Exact URL hash match
  const urlHash = hashUrl(canonicalUrl);
  const existing = await findByUrlHash(urlHash);
  if (existing) {
    logger.debug(`Duplicate detected (URL hash): ${canonicalUrl}`);
    return true;
  }

  // Stage 2: Fuzzy title match within 6-hour window
  if (title) {
    const sixHoursAgo = new Date(publishedAt.getTime() - 6 * 60 * 60 * 1000);
    const recentCards = await findByTimeRange(sixHoursAgo, publishedAt);

    for (const card of recentCards) {
      if (isSimilar(title, card.headline)) {
        logger.debug(`Duplicate detected (fuzzy title): "${title}" ~ "${card.headline}"`);
        return true;
      }
    }
  }

  return false;
}
