import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../config.js', () => ({
  loadConfig: vi.fn().mockReturnValue({ githubPat: 'test-pat' }),
}));
vi.mock('../../utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { isBotAuthor, isSignificantEipPR, GitHubRepoFetcher } from '../github-repo.js';

// ── isBotAuthor ──────────────────────────────────────────────────────────

describe('isBotAuthor', () => {
  it('returns true for "dependabot[bot]"', () => {
    expect(isBotAuthor('dependabot[bot]')).toBe(true);
  });

  it('returns true for "eth-bot"', () => {
    expect(isBotAuthor('eth-bot')).toBe(true);
  });

  it('returns true for "eip-review-bot"', () => {
    expect(isBotAuthor('eip-review-bot')).toBe(true);
  });

  it('returns true for "eip-automerger"', () => {
    expect(isBotAuthor('eip-automerger')).toBe(true);
  });

  it('returns false for "vitalik"', () => {
    expect(isBotAuthor('vitalik')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isBotAuthor(null)).toBe(false);
  });
});

// ── isSignificantEipPR ───────────────────────────────────────────────────

describe('isSignificantEipPR', () => {
  it('returns true for "Add ERC: Crosschain Token Interface"', () => {
    expect(isSignificantEipPR('Add ERC: Crosschain Token Interface', null)).toBe(true);
  });

  it('returns true for "Add EIP-7702: Title"', () => {
    expect(isSignificantEipPR('Add EIP-7702: Title', null)).toBe(true);
  });

  it('returns true for "Update ERC-7425: Clarify Language"', () => {
    expect(isSignificantEipPR('Update ERC-7425: Clarify Language', null)).toBe(true);
  });

  it('returns true for "Move ERC-7893: Move to Final"', () => {
    expect(isSignificantEipPR('Move ERC-7893: Move to Final', null)).toBe(true);
  });

  it('returns true for "ERC-7425: Something"', () => {
    expect(isSignificantEipPR('ERC-7425: Something', null)).toBe(true);
  });

  it('returns true for "ERC: Account Abstraction"', () => {
    expect(isSignificantEipPR('ERC: Account Abstraction', null)).toBe(true);
  });

  it('returns false for "CI: Update ci.yml"', () => {
    expect(isSignificantEipPR('CI: Update ci.yml', null)).toBe(false);
  });

  it('returns false for "Config: Fix merge-repos race"', () => {
    expect(isSignificantEipPR('Config: Fix merge-repos race', null)).toBe(false);
  });

  it('returns false for "Add ERC: Title" when author is "eth-bot"', () => {
    expect(isSignificantEipPR('Add ERC: Title', 'eth-bot')).toBe(false);
  });
});

// ── GitHubRepoFetcher ────────────────────────────────────────────────────

describe('GitHubRepoFetcher', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createFetcher(overrides: Record<string, any> = {}) {
    return new GitHubRepoFetcher({
      sourceId: 'github.com/ethereum/EIPs',
      baseUrl: 'https://github.com/ethereum/EIPs',
      apiType: 'github_api',
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

  it('fetches merged pulls and new proposals for EIP repos', async () => {
    const fetcher = createFetcher();

    // First call: merged pulls (state=closed)
    mockFetch.mockResolvedValueOnce(mockJsonResponse([
      {
        number: 100,
        title: 'Add ERC: New Token Standard',
        body: 'Description here',
        html_url: 'https://github.com/ethereum/EIPs/pull/100',
        user: { login: 'alice' },
        labels: [{ name: 'erc' }],
        created_at: '2024-01-15T10:00:00Z',
        merged_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
      },
    ]));

    // Second call: new proposals (state=open)
    mockFetch.mockResolvedValueOnce(mockJsonResponse([
      {
        number: 101,
        title: 'Add ERC: Another Standard',
        body: 'Another description',
        html_url: 'https://github.com/ethereum/EIPs/pull/101',
        user: { login: 'bob' },
        labels: [],
        created_at: '2024-01-16T10:00:00Z',
        merged_at: null,
        updated_at: '2024-01-16T10:00:00Z',
      },
    ]));

    const results = await fetcher.fetch();
    expect(results.length).toBe(2);
    expect(results[0].canonicalUrl).toBe('https://github.com/ethereum/EIPs/pull/100');
    expect(results[1].canonicalUrl).toBe('https://github.com/ethereum/EIPs/pull/101');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('fetches issues for "pm" repo', async () => {
    const fetcher = createFetcher({
      sourceId: 'github.com/ethereum/pm',
      baseUrl: 'https://github.com/ethereum/pm',
    });

    mockFetch.mockResolvedValueOnce(mockJsonResponse([
      {
        number: 50,
        title: 'ACD Call #200',
        body: 'Agenda for call',
        html_url: 'https://github.com/ethereum/pm/issues/50',
        user: { login: 'timbeiko' },
        labels: [{ name: 'ACD' }],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]));

    const results = await fetcher.fetch();
    expect(results.length).toBe(1);
    expect(results[0].rawTitle).toBe('ACD Call #200');
    expect(results[0].rawMetadata.type).toBe('issue');
  });

  it('handles API error (returns empty array)', async () => {
    const fetcher = createFetcher();

    // Both API calls fail
    mockFetch.mockResolvedValueOnce(mockJsonResponse(null, 403));
    mockFetch.mockResolvedValueOnce(mockJsonResponse(null, 403));

    const results = await fetcher.fetch();
    expect(results).toEqual([]);
  });

  it('filters bot-authored PRs', async () => {
    const fetcher = createFetcher();

    // Merged pulls: one by bot, one by human
    mockFetch.mockResolvedValueOnce(mockJsonResponse([
      {
        number: 200,
        title: 'Add ERC: Bot Proposal',
        body: 'By a bot',
        html_url: 'https://github.com/ethereum/EIPs/pull/200',
        user: { login: 'eth-bot' },
        labels: [],
        created_at: '2024-01-15T10:00:00Z',
        merged_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
      },
      {
        number: 201,
        title: 'Add ERC: Human Proposal',
        body: 'By a human',
        html_url: 'https://github.com/ethereum/EIPs/pull/201',
        user: { login: 'alice' },
        labels: [],
        created_at: '2024-01-15T10:00:00Z',
        merged_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
      },
    ]));

    // New proposals: empty
    mockFetch.mockResolvedValueOnce(mockJsonResponse([]));

    const results = await fetcher.fetch();
    expect(results.length).toBe(1);
    expect(results[0].canonicalUrl).toBe('https://github.com/ethereum/EIPs/pull/201');
  });

  it('deduplicates results by URL', async () => {
    const fetcher = createFetcher();

    const sharedPR = {
      number: 300,
      title: 'Add ERC: Shared PR',
      body: 'Appears in both',
      html_url: 'https://github.com/ethereum/EIPs/pull/300',
      user: { login: 'alice' },
      labels: [],
      created_at: '2024-01-15T10:00:00Z',
      merged_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
    };

    // Merged pulls: contains PR 300
    mockFetch.mockResolvedValueOnce(mockJsonResponse([sharedPR]));
    // New proposals: also contains PR 300
    mockFetch.mockResolvedValueOnce(mockJsonResponse([sharedPR]));

    const results = await fetcher.fetch();
    // Should only appear once despite being in both lists
    const urls = results.map((r) => r.canonicalUrl);
    const uniqueUrls = [...new Set(urls)];
    expect(urls.length).toBe(uniqueUrls.length);
    expect(results.filter((r) => r.canonicalUrl === sharedPR.html_url)).toHaveLength(1);
  });
});
