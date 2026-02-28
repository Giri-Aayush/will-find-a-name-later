import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let checkRateLimit: typeof import('../rate-limit').checkRateLimit;
let checkUserRateLimit: typeof import('../rate-limit').checkUserRateLimit;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  const mod = await import('../rate-limit');
  checkRateLimit = mod.checkRateLimit;
  checkUserRateLimit = mod.checkUserRateLimit;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('checkRateLimit', () => {
  it('allows the first request with 299 remaining', () => {
    const result = checkRateLimit('192.168.1.1');
    expect(result).toEqual({ allowed: true, remaining: 299 });
  });

  it('allows up to 300 requests', () => {
    for (let i = 0; i < 299; i++) {
      checkRateLimit('10.0.0.1');
    }
    const result = checkRateLimit('10.0.0.1');
    expect(result).toEqual({ allowed: true, remaining: 0 });
  });

  it('denies request #301', () => {
    for (let i = 0; i < 300; i++) {
      checkRateLimit('10.0.0.2');
    }
    const result = checkRateLimit('10.0.0.2');
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it('resets after the window expires', () => {
    for (let i = 0; i < 300; i++) {
      checkRateLimit('10.0.0.3');
    }
    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);
    const result = checkRateLimit('10.0.0.3');
    expect(result).toEqual({ allowed: true, remaining: 299 });
  });

  it('tracks different IPs independently', () => {
    for (let i = 0; i < 300; i++) {
      checkRateLimit('10.0.0.4');
    }
    // IP 10.0.0.4 is exhausted, but 10.0.0.5 is fresh
    const result = checkRateLimit('10.0.0.5');
    expect(result).toEqual({ allowed: true, remaining: 299 });
  });
});

describe('checkUserRateLimit', () => {
  it('allows the first request with custom limits', () => {
    const result = checkUserRateLimit('user1', 'vote', 10, 30_000);
    expect(result).toEqual({ allowed: true, remaining: 9 });
  });

  it('denies requests exceeding custom limit', () => {
    for (let i = 0; i < 10; i++) {
      checkUserRateLimit('user2', 'vote', 10, 30_000);
    }
    const result = checkUserRateLimit('user2', 'vote', 10, 30_000);
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it('treats different userId:action combos independently', () => {
    for (let i = 0; i < 5; i++) {
      checkUserRateLimit('user3', 'vote', 5, 30_000);
    }
    // user3:vote is exhausted, but user4:vote is fresh
    const result = checkUserRateLimit('user4', 'vote', 5, 30_000);
    expect(result).toEqual({ allowed: true, remaining: 4 });
  });

  it('resets after custom window expires', () => {
    for (let i = 0; i < 5; i++) {
      checkUserRateLimit('user5', 'flag', 5, 20_000);
    }
    vi.advanceTimersByTime(21_000);
    const result = checkUserRateLimit('user5', 'flag', 5, 20_000);
    expect(result).toEqual({ allowed: true, remaining: 4 });
  });

  it('tracks the same user with different actions separately', () => {
    for (let i = 0; i < 3; i++) {
      checkUserRateLimit('user6', 'vote', 3, 30_000);
    }
    // user6:vote is exhausted, but user6:flag is fresh
    const result = checkUserRateLimit('user6', 'flag', 3, 30_000);
    expect(result).toEqual({ allowed: true, remaining: 2 });
  });

  it('returns correct remaining count as requests are made', () => {
    checkUserRateLimit('user7', 'share', 5, 30_000);
    expect(checkUserRateLimit('user7', 'share', 5, 30_000)).toEqual({
      allowed: true,
      remaining: 3,
    });
    expect(checkUserRateLimit('user7', 'share', 5, 30_000)).toEqual({
      allowed: true,
      remaining: 2,
    });
    expect(checkUserRateLimit('user7', 'share', 5, 30_000)).toEqual({
      allowed: true,
      remaining: 1,
    });
    expect(checkUserRateLimit('user7', 'share', 5, 30_000)).toEqual({
      allowed: true,
      remaining: 0,
    });
  });
});
