import type { FetchResult, FetcherConfig } from '@hexcast/shared';

const DEFAULT_TIMEOUT_MS = 30_000;

export abstract class BaseFetcher {
  protected config: FetcherConfig;

  constructor(config: FetcherConfig) {
    this.config = config;
  }

  abstract fetch(): Promise<FetchResult[]>;

  protected buildUrl(path: string): string {
    return new URL(path, this.config.baseUrl).toString();
  }

  protected isAfterLastPoll(date: Date | null): boolean {
    if (!date) return true;
    if (!this.config.lastPolledAt) return true;
    return date.getTime() > this.config.lastPolledAt.getTime();
  }

  /** fetch() wrapper with AbortController timeout (default 30s) */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs = DEFAULT_TIMEOUT_MS
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }
}
