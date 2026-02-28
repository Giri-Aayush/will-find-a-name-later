import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => {
  return {
    mockGetUnprocessedItems: vi.fn(),
    mockMarkAsProcessed: vi.fn(),
    mockCreateCard: vi.fn(),
    mockNormalize: vi.fn(),
    mockIsDuplicate: vi.fn(),
    mockClassify: vi.fn(),
    mockSummarize: vi.fn(),
    mockScoreQuality: vi.fn(),
    mockShouldAutoSuppress: vi.fn(),
    mockHashUrl: vi.fn(),
    mockLoadConfig: vi.fn(),
    mockLogger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
    mockSupabase: { from: vi.fn() },
  };
});

vi.mock('../../db/raw-items.js', () => ({
  getUnprocessedItems: mocks.mockGetUnprocessedItems,
  markAsProcessed: mocks.mockMarkAsProcessed,
}));

vi.mock('../../db/cards.js', () => ({
  createCard: mocks.mockCreateCard,
}));

vi.mock('../normalizer.js', () => ({
  normalize: mocks.mockNormalize,
}));

vi.mock('../deduplicator.js', () => ({
  isDuplicate: mocks.mockIsDuplicate,
}));

vi.mock('../classifier.js', () => ({
  classify: mocks.mockClassify,
}));

vi.mock('../summarizer.js', () => ({
  summarize: mocks.mockSummarize,
}));

vi.mock('../quality-scorer.js', () => ({
  scoreQuality: mocks.mockScoreQuality,
  shouldAutoSuppress: mocks.mockShouldAutoSuppress,
}));

vi.mock('../../utils/hash.js', () => ({
  hashUrl: mocks.mockHashUrl,
}));

vi.mock('../../config.js', () => ({
  loadConfig: mocks.mockLoadConfig,
}));

vi.mock('../../utils/logger.js', () => ({
  logger: mocks.mockLogger,
}));

vi.mock('../../db/client.js', () => ({
  supabase: mocks.mockSupabase,
}));

// ── Import under test (after mocks) ─────────────────────────────────────

import { processRawItems } from '../pipeline.js';

// ── Helpers ──────────────────────────────────────────────────────────────

function makeItem(id: string) {
  return {
    id,
    source_id: 'test',
    canonical_url: `https://example.com/${id}`,
    raw_title: 'Test',
    raw_text: 'Test content',
    raw_metadata: {},
    published_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    processed: false,
  };
}

function makeNormalized(id: string) {
  return {
    sourceId: 'test',
    canonicalUrl: `https://example.com/${id}`,
    title: 'Test Title',
    author: 'test-author',
    publishedAt: new Date(),
    fullText: 'Test full text content for summarization.',
    engagement: { likes: 5 },
    rawMetadata: {},
  };
}

const defaultConfig = {
  batchSize: 100,
  concurrency: 1,
  dryRun: false,
  env: 'dev' as const,
  pipelineVersion: '1.0.0',
};

// ── Setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Default config
  mocks.mockLoadConfig.mockReturnValue({ ...defaultConfig });

  // Default happy-path mocks
  mocks.mockMarkAsProcessed.mockResolvedValue(undefined);
  mocks.mockIsDuplicate.mockResolvedValue(false);
  mocks.mockClassify.mockReturnValue('ANNOUNCEMENT');
  mocks.mockSummarize.mockResolvedValue({ headline: 'Test Headline', summary: 'Test summary text.' });
  mocks.mockScoreQuality.mockReturnValue(0.8);
  mocks.mockShouldAutoSuppress.mockReturnValue(false);
  mocks.mockHashUrl.mockReturnValue('abc123hash');
  mocks.mockCreateCard.mockResolvedValue('card-uuid-1');
});

// ── Tests ────────────────────────────────────────────────────────────────

describe('processRawItems', () => {
  it('returns zeros when no unprocessed items exist', async () => {
    mocks.mockGetUnprocessedItems.mockResolvedValue([]);

    const result = await processRawItems();

    expect(result).toEqual({ processed: 0, skipped: 0, failed: 0 });
    expect(mocks.mockNormalize).not.toHaveBeenCalled();
  });

  it('skips and marks as processed when normalize returns null', async () => {
    const item = makeItem('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(null);

    const result = await processRawItems();

    expect(result).toEqual({ processed: 0, skipped: 1, failed: 0 });
    expect(mocks.mockMarkAsProcessed).toHaveBeenCalledWith('item-1');
    expect(mocks.mockSummarize).not.toHaveBeenCalled();
  });

  it('skips and marks as processed when duplicate is detected', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);
    mocks.mockIsDuplicate.mockResolvedValue(true);

    const result = await processRawItems();

    expect(result).toEqual({ processed: 0, skipped: 1, failed: 0 });
    expect(mocks.mockMarkAsProcessed).toHaveBeenCalledWith('item-1');
    expect(mocks.mockIsDuplicate).toHaveBeenCalledWith(
      normalized.canonicalUrl,
      normalized.title,
      normalized.publishedAt,
    );
    expect(mocks.mockSummarize).not.toHaveBeenCalled();
  });

  it('skips without summarizing or marking as processed in dry run mode', async () => {
    mocks.mockLoadConfig.mockReturnValue({ ...defaultConfig, dryRun: true });
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);

    const result = await processRawItems();

    expect(result).toEqual({ processed: 0, skipped: 1, failed: 0 });
    expect(mocks.mockSummarize).not.toHaveBeenCalled();
    // Dry run does NOT call markAsProcessed
    expect(mocks.mockMarkAsProcessed).not.toHaveBeenCalled();
  });

  it('skips and marks as processed when quality score triggers auto-suppress', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);
    mocks.mockScoreQuality.mockReturnValue(0.1);
    mocks.mockShouldAutoSuppress.mockReturnValue(true);

    const result = await processRawItems();

    expect(result).toEqual({ processed: 0, skipped: 1, failed: 0 });
    expect(mocks.mockMarkAsProcessed).toHaveBeenCalledWith('item-1');
    expect(mocks.mockCreateCard).not.toHaveBeenCalled();
    expect(mocks.mockShouldAutoSuppress).toHaveBeenCalledWith(0.1);
  });

  it('processes a full item through all pipeline stages successfully', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);

    const result = await processRawItems();

    expect(result).toEqual({ processed: 1, skipped: 0, failed: 0 });

    // Verify full pipeline was exercised
    expect(mocks.mockNormalize).toHaveBeenCalledWith(item);
    expect(mocks.mockIsDuplicate).toHaveBeenCalledWith(
      normalized.canonicalUrl,
      normalized.title,
      normalized.publishedAt,
    );
    expect(mocks.mockClassify).toHaveBeenCalledWith(normalized.sourceId);
    expect(mocks.mockSummarize).toHaveBeenCalledWith(normalized.fullText, normalized.title);
    expect(mocks.mockScoreQuality).toHaveBeenCalledWith({
      sourceId: normalized.sourceId,
      headline: 'Test Headline',
      summary: 'Test summary text.',
      author: normalized.author,
      engagement: normalized.engagement,
    });
    expect(mocks.mockCreateCard).toHaveBeenCalledWith({
      sourceId: normalized.sourceId,
      canonicalUrl: normalized.canonicalUrl,
      urlHash: 'abc123hash',
      category: 'ANNOUNCEMENT',
      headline: 'Test Headline',
      summary: 'Test summary text.',
      author: normalized.author,
      publishedAt: normalized.publishedAt,
      engagement: normalized.engagement,
      pipelineVersion: '1.0.0',
      qualityScore: 0.8,
    });
    expect(mocks.mockMarkAsProcessed).toHaveBeenCalledWith('item-1');
  });

  it('queues SECURITY category cards to high_priority_queue', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);
    mocks.mockClassify.mockReturnValue('SECURITY');
    mocks.mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await processRawItems();

    expect(result).toEqual({ processed: 1, skipped: 0, failed: 0 });
    expect(mocks.mockSupabase.from).toHaveBeenCalledWith('high_priority_queue');
    expect(mocks.mockSupabase.from('high_priority_queue').insert).toHaveBeenCalledWith({
      card_id: 'card-uuid-1',
      category: 'SECURITY',
    });
    expect(mocks.mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('HIGH PRIORITY: SECURITY card queued'),
    );
  });

  it('queues UPGRADE category cards to high_priority_queue', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);
    mocks.mockClassify.mockReturnValue('UPGRADE');
    mocks.mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await processRawItems();

    expect(result).toEqual({ processed: 1, skipped: 0, failed: 0 });
    expect(mocks.mockSupabase.from).toHaveBeenCalledWith('high_priority_queue');
    expect(mocks.mockSupabase.from('high_priority_queue').insert).toHaveBeenCalledWith({
      card_id: 'card-uuid-1',
      category: 'UPGRADE',
    });
  });

  it('does not queue non-priority categories to high_priority_queue', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);
    mocks.mockClassify.mockReturnValue('RESEARCH');

    const result = await processRawItems();

    expect(result).toEqual({ processed: 1, skipped: 0, failed: 0 });
    expect(mocks.mockSupabase.from).not.toHaveBeenCalled();
  });

  it('logs warning but still counts as processed when high_priority_queue insert fails', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);
    mocks.mockClassify.mockReturnValue('SECURITY');
    mocks.mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        error: { message: 'constraint violation' },
      }),
    });

    const result = await processRawItems();

    expect(result).toEqual({ processed: 1, skipped: 0, failed: 0 });
    expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to queue high-priority card'),
    );
    expect(mocks.mockMarkAsProcessed).toHaveBeenCalledWith('item-1');
  });

  it('counts as failed and does not mark as processed when summarize throws', async () => {
    const item = makeItem('item-1');
    const normalized = makeNormalized('item-1');
    mocks.mockGetUnprocessedItems.mockResolvedValue([item]);
    mocks.mockNormalize.mockReturnValue(normalized);
    mocks.mockSummarize.mockRejectedValue(new Error('OpenAI API timeout'));

    const result = await processRawItems();

    expect(result).toEqual({ processed: 0, skipped: 0, failed: 1 });
    expect(mocks.mockMarkAsProcessed).not.toHaveBeenCalled();
    expect(mocks.mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to process item item-1'),
      expect.any(Error),
    );
  });

  it('limits processing to batchSize even when more items are available', async () => {
    const items = Array.from({ length: 100 }, (_, i) => makeItem(`item-${i}`));
    mocks.mockLoadConfig.mockReturnValue({ ...defaultConfig, batchSize: 10 });
    mocks.mockGetUnprocessedItems.mockResolvedValue(items);

    // Set up each of the 10 items to be processed successfully
    for (let i = 0; i < 10; i++) {
      mocks.mockNormalize.mockReturnValueOnce(makeNormalized(`item-${i}`));
    }

    const result = await processRawItems();

    expect(result.processed + result.skipped + result.failed).toBe(10);
    expect(mocks.mockNormalize).toHaveBeenCalledTimes(10);
  });

  it('handles mixed results: 1 success, 1 duplicate, 1 failure', async () => {
    const items = [makeItem('success'), makeItem('dup'), makeItem('fail')];
    mocks.mockGetUnprocessedItems.mockResolvedValue(items);

    // Item 1: success
    const normalizedSuccess = makeNormalized('success');
    // Item 2: duplicate
    const normalizedDup = makeNormalized('dup');
    // Item 3: fails during summarize
    const normalizedFail = makeNormalized('fail');

    mocks.mockNormalize
      .mockReturnValueOnce(normalizedSuccess)
      .mockReturnValueOnce(normalizedDup)
      .mockReturnValueOnce(normalizedFail);

    mocks.mockIsDuplicate
      .mockResolvedValueOnce(false) // success
      .mockResolvedValueOnce(true)  // dup
      .mockResolvedValueOnce(false); // fail

    mocks.mockSummarize
      .mockResolvedValueOnce({ headline: 'Good Headline', summary: 'Good summary.' }) // success
      .mockRejectedValueOnce(new Error('API error')); // fail

    const result = await processRawItems();

    expect(result).toEqual({ processed: 1, skipped: 1, failed: 1 });
    // success and dup are marked as processed; fail is not
    expect(mocks.mockMarkAsProcessed).toHaveBeenCalledWith('success');
    expect(mocks.mockMarkAsProcessed).toHaveBeenCalledWith('dup');
    expect(mocks.mockMarkAsProcessed).not.toHaveBeenCalledWith('fail');
  });
});
