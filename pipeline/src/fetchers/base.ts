import type { FetchResult, FetcherConfig } from '@ethpulse/shared';

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
}
