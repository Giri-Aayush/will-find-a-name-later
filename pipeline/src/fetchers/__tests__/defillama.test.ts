import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockLogger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../../utils/logger.js', () => ({ logger: mocks.mockLogger }));

import { DefiLlamaFetcher } from '../defillama.js';
import type { FetcherConfig } from '@hexcast/shared';

function createFetcher(overrides: Partial<FetcherConfig> = {}): DefiLlamaFetcher {
  return new DefiLlamaFetcher({
    sourceId: 'defillama.com/stablecoins',
    baseUrl: 'https://defillama.com',
    apiType: 'rest_api',
    lastPolledAt: null,
    ...overrides,
  });
}

function mockJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

describe('DefiLlamaFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mocks.mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetch() dispatching', () => {
    it('dispatches to stablecoins sub-fetcher for defillama.com/stablecoins', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ peggedAssets: [] }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      await fetcher.fetch();

      expect(mocks.mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('stablecoins.llama.fi/stablecoins'),
      );
    });

    it('dispatches to chainTvl sub-fetcher for defillama.com/chains', async () => {
      // Will be called for each TRACKED_CHAIN. Mock them all to return minimal data.
      mocks.mockFetch.mockResolvedValue(mockJsonResponse([]));

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      await fetcher.fetch();

      expect(mocks.mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.llama.fi/v2/historicalChainTvl/'),
      );
    });

    it('dispatches to dexVolumes sub-fetcher for defillama.com/dexs', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({ protocols: [], total24h: 0, change_1d: 0, change_7d: 0 }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      await fetcher.fetch();

      expect(mocks.mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.llama.fi/overview/dexs'),
      );
    });

    it('returns empty for unknown sourceId', async () => {
      const fetcher = createFetcher({ sourceId: 'defillama.com/unknown' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
      expect(mocks.mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unknown DefiLlama source'),
      );
    });
  });

  describe('Stablecoins', () => {
    function makeStablecoin(overrides: Record<string, any> = {}) {
      return {
        id: 'usdt',
        name: 'Tether',
        symbol: 'USDT',
        circulating: { peggedUSD: 120_000_000_000 }, // $120B
        circulatingPrevDay: { peggedUSD: 115_000_000_000 }, // ~4.3% daily change
        circulatingPrevWeek: { peggedUSD: 110_000_000_000 },
        circulatingPrevMonth: { peggedUSD: 100_000_000_000 },
        chainCirculating: {
          Ethereum: { current: { peggedUSD: 50_000_000_000 } },
          Tron: { current: { peggedUSD: 40_000_000_000 } },
        },
        chains: ['Ethereum', 'Tron', 'BSC', 'Solana'],
        price: 1.0001,
        ...overrides,
      };
    }

    it('returns results for significant stablecoin changes', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          peggedAssets: [makeStablecoin()],
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      const results = await fetcher.fetch();

      expect(results).toHaveLength(1);
      expect(results[0].sourceId).toBe('defillama.com/stablecoins');
      expect(results[0].rawTitle).toContain('Tether');
      expect(results[0].rawTitle).toContain('USDT');
      expect(results[0].rawText).toContain('Circulating Supply');
      expect(results[0].rawMetadata.metric_type).toBe('stablecoin');
      expect(results[0].rawMetadata.symbol).toBe('USDT');
      expect(results[0].publishedAt).toBeInstanceOf(Date);
    });

    it('skips stablecoins under $100M', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          peggedAssets: [
            makeStablecoin({
              name: 'TinyStable',
              symbol: 'TINY',
              circulating: { peggedUSD: 50_000_000 }, // $50M < $100M threshold
              circulatingPrevDay: { peggedUSD: 25_000_000 },
              circulatingPrevWeek: { peggedUSD: 10_000_000 },
              circulatingPrevMonth: { peggedUSD: 5_000_000 },
            }),
          ],
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
    });

    it('skips non-significant changes', async () => {
      // Small stable (< $1B) with tiny daily change, small weekly, small monthly
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          peggedAssets: [
            makeStablecoin({
              name: 'StableStable',
              symbol: 'STBL',
              circulating: { peggedUSD: 500_000_000 }, // $500M (< $1B large cap)
              circulatingPrevDay: { peggedUSD: 499_000_000 }, // ~0.2% daily
              circulatingPrevWeek: { peggedUSD: 495_000_000 }, // ~1% weekly
              circulatingPrevMonth: { peggedUSD: 490_000_000 }, // ~2% monthly
            }),
          ],
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
    });

    it('handles API error (non-ok response)', async () => {
      mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(null, 500));

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
      expect(mocks.mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('stablecoins API error'),
      );
    });

    it('detects significant weekly change even for sub-$1B stables', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          peggedAssets: [
            makeStablecoin({
              name: 'WeeklyMover',
              symbol: 'WKMV',
              circulating: { peggedUSD: 200_000_000 }, // $200M, under $1B large cap
              circulatingPrevDay: { peggedUSD: 199_000_000 }, // ~0.5% daily (not significant for daily)
              circulatingPrevWeek: { peggedUSD: 160_000_000 }, // 25% weekly (> 10% threshold)
              circulatingPrevMonth: { peggedUSD: 190_000_000 }, // ~5% monthly
            }),
          ],
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      const results = await fetcher.fetch();

      expect(results).toHaveLength(1);
      expect(results[0].rawMetadata.symbol).toBe('WKMV');
    });

    it('includes price in text output', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          peggedAssets: [makeStablecoin({ price: 0.9985 })],
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      const results = await fetcher.fetch();

      expect(results[0].rawText).toContain('$0.9985');
    });

    it('handles null price', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          peggedAssets: [makeStablecoin({ price: null })],
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/stablecoins' });
      const results = await fetcher.fetch();

      expect(results[0].rawText).toContain('Price: N/A');
    });
  });

  describe('Chain TVL', () => {
    function makeChainTvlData(latestTvl: number, yesterdayTvl: number, weekAgoTvl: number) {
      // Need at least 8 points
      const points = [];
      for (let i = 0; i < 6; i++) {
        points.push({ date: 1700000000 + i * 86400, tvl: weekAgoTvl });
      }
      points.push({ date: 1700000000 + 6 * 86400, tvl: weekAgoTvl }); // index 6 = week ago
      points.push({ date: 1700000000 + 7 * 86400, tvl: yesterdayTvl }); // index 7 = yesterday
      points.push({ date: 1700000000 + 8 * 86400, tvl: latestTvl }); // index 8 = latest
      return points;
    }

    it('returns results for significant TVL changes', async () => {
      // Only mock the first chain (Ethereum) with significant data, rest with small data
      let callIndex = 0;
      mocks.mockFetch.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          // Ethereum: 50% daily change (significant)
          return Promise.resolve(
            mockJsonResponse(makeChainTvlData(30_000_000_000, 20_000_000_000, 15_000_000_000)),
          );
        }
        // All other chains: not enough data
        return Promise.resolve(mockJsonResponse([]));
      });

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      const results = await fetcher.fetch();

      expect(results.length).toBeGreaterThanOrEqual(1);
      const ethResult = results.find((r) => r.rawMetadata.chain === 'Ethereum');
      expect(ethResult).toBeDefined();
      expect(ethResult!.rawTitle).toContain('Ethereum');
      expect(ethResult!.rawTitle).toContain('TVL');
      expect(ethResult!.rawMetadata.metric_type).toBe('chain_tvl');
    });

    it('skips chains with insufficient data (<8 points)', async () => {
      mocks.mockFetch.mockResolvedValue(
        mockJsonResponse([
          { date: 1700000000, tvl: 1_000_000_000 },
          { date: 1700086400, tvl: 1_100_000_000 },
        ]),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
    });

    it('skips chains with non-significant TVL changes', async () => {
      // Very small changes: ~1% daily, ~2% weekly
      mocks.mockFetch.mockResolvedValue(
        mockJsonResponse(makeChainTvlData(10_100_000_000, 10_000_000_000, 9_900_000_000)),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
    });

    it('handles API error for individual chain', async () => {
      mocks.mockFetch.mockResolvedValue(mockJsonResponse(null, 500));

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
      // Should log debug for each failed chain
      expect(mocks.mockLogger.debug).toHaveBeenCalled();
    });

    it('handles fetch throwing for individual chain', async () => {
      mocks.mockFetch.mockRejectedValue(new Error('Network failure'));

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
      expect(mocks.mockLogger.debug).toHaveBeenCalled();
    });

    it('reports rising TVL correctly', async () => {
      let callIndex = 0;
      mocks.mockFetch.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return Promise.resolve(
            mockJsonResponse(makeChainTvlData(50_000_000_000, 30_000_000_000, 25_000_000_000)),
          );
        }
        return Promise.resolve(mockJsonResponse([]));
      });

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      const results = await fetcher.fetch();

      const ethResult = results.find((r) => r.rawMetadata.chain === 'Ethereum');
      expect(ethResult).toBeDefined();
      expect(ethResult!.rawTitle).toContain('Rises');
    });

    it('reports dropping TVL correctly', async () => {
      let callIndex = 0;
      mocks.mockFetch.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          // Ethereum: -50% daily (drops significantly)
          return Promise.resolve(
            mockJsonResponse(makeChainTvlData(10_000_000_000, 20_000_000_000, 25_000_000_000)),
          );
        }
        return Promise.resolve(mockJsonResponse([]));
      });

      const fetcher = createFetcher({ sourceId: 'defillama.com/chains' });
      const results = await fetcher.fetch();

      const ethResult = results.find((r) => r.rawMetadata.chain === 'Ethereum');
      expect(ethResult).toBeDefined();
      expect(ethResult!.rawTitle).toContain('Drops');
    });
  });

  describe('DEX Volumes', () => {
    function makeDexProtocol(overrides: Record<string, any> = {}) {
      return {
        name: 'Uniswap',
        displayName: 'Uniswap V3',
        chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Base', 'Optimism', 'BSC'],
        total24h: 500_000_000, // $500M
        total7d: 3_000_000_000,
        total30d: 12_000_000_000,
        totalAllTime: 2_000_000_000_000,
        change_1d: 150, // 150% daily change (significant)
        change_7d: 80,
        change_1m: 30,
        ...overrides,
      };
    }

    it('returns results for significant volume changes', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [makeDexProtocol()],
          total24h: 500_000_000,
          change_1d: 50,
          change_7d: 20,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results).toHaveLength(1);
      expect(results[0].sourceId).toBe('defillama.com/dexs');
      expect(results[0].rawTitle).toContain('Uniswap V3');
      expect(results[0].rawTitle).toContain('Volume');
      expect(results[0].rawTitle).toContain('Surges');
      expect(results[0].rawMetadata.metric_type).toBe('dex_volume');
      expect(results[0].rawMetadata.protocol).toBe('Uniswap');
    });

    it('skips DEXes under $10M daily volume', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [
            makeDexProtocol({
              name: 'SmallDex',
              total24h: 5_000_000, // $5M < $10M threshold
              change_1d: 200,
              change_7d: 100,
            }),
          ],
          total24h: 5_000_000,
          change_1d: 0,
          change_7d: 0,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
    });

    it('skips DEXes with non-significant changes', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [
            makeDexProtocol({
              name: 'SteadyDex',
              total24h: 50_000_000,
              change_1d: 5, // 5% < 100% threshold
              change_7d: 10, // 10% < 75% threshold
            }),
          ],
          total24h: 50_000_000,
          change_1d: 5,
          change_7d: 10,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
    });

    it('handles API error', async () => {
      mocks.mockFetch.mockResolvedValueOnce(mockJsonResponse(null, 500));

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results).toEqual([]);
      expect(mocks.mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('DEX API error'),
      );
    });

    it('handles null total24h as 0', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [
            makeDexProtocol({
              total24h: null,
              change_1d: 200,
              change_7d: 100,
            }),
          ],
          total24h: 0,
          change_1d: 0,
          change_7d: 0,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      // null total24h => 0 => under $10M threshold => skip
      expect(results).toEqual([]);
    });

    it('reports volume drops correctly', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [
            makeDexProtocol({
              change_1d: -120, // Negative = drops
            }),
          ],
          total24h: 500_000_000,
          change_1d: -50,
          change_7d: -20,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results).toHaveLength(1);
      expect(results[0].rawTitle).toContain('Drops');
    });

    it('uses displayName over name for title', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [
            makeDexProtocol({
              name: 'uniswap',
              displayName: 'Uniswap V3',
            }),
          ],
          total24h: 0,
          change_1d: 0,
          change_7d: 0,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results[0].rawTitle).toContain('Uniswap V3');
    });

    it('truncates chains list to 5 and shows remainder count', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [
            makeDexProtocol({
              chains: ['Ethereum', 'Arbitrum', 'Polygon', 'Base', 'Optimism', 'BSC', 'Avalanche'],
            }),
          ],
          total24h: 0,
          change_1d: 0,
          change_7d: 0,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results[0].rawText).toContain('and 2 more');
    });

    it('generates correct canonical URL slug', async () => {
      mocks.mockFetch.mockResolvedValueOnce(
        mockJsonResponse({
          protocols: [
            makeDexProtocol({ name: 'Trader Joe' }),
          ],
          total24h: 0,
          change_1d: 0,
          change_7d: 0,
        }),
      );

      const fetcher = createFetcher({ sourceId: 'defillama.com/dexs' });
      const results = await fetcher.fetch();

      expect(results[0].canonicalUrl).toContain('protocol=trader-joe');
    });
  });
});
