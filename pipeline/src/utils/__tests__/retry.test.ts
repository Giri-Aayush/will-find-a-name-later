import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { retry } from '../retry.js';
import { logger } from '../logger.js';

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValueOnce('hello');

    const promise = retry(fn);
    await expect(promise).resolves.toBe('hello');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure, succeeds on 2nd attempt', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockResolvedValueOnce('ok');

    const promise = retry(fn, { delayMs: 1000 });
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after maxRetries exhausted (default 3)', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockRejectedValueOnce(new Error('fail3'));

    const assertion = expect(retry(fn, { delayMs: 1000 })).rejects.toThrow('fail3');
    await vi.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('uses exponential backoff: delays are 1000, 2000, 4000ms', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockRejectedValueOnce(new Error('fail3'))
      .mockResolvedValueOnce('ok');

    const promise = retry(fn, { maxRetries: 4, delayMs: 1000 });

    // After attempt 1 fails, delay = 1000 * 2^0 = 1000ms
    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).toHaveBeenCalledTimes(2);

    // After attempt 2 fails, delay = 1000 * 2^1 = 2000ms
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(3);

    // After attempt 3 fails, delay = 1000 * 2^2 = 4000ms
    await vi.advanceTimersByTimeAsync(4000);
    expect(fn).toHaveBeenCalledTimes(4);

    await expect(promise).resolves.toBe('ok');
  });

  it('respects custom maxRetries', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'));

    const assertion = expect(retry(fn, { maxRetries: 2, delayMs: 100 })).rejects.toThrow('fail2');
    await vi.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects custom delayMs', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('done');

    const promise = retry(fn, { delayMs: 500 });

    // Should not resolve before 500ms
    await vi.advanceTimersByTimeAsync(499);
    expect(fn).toHaveBeenCalledTimes(1);

    // Should resolve after 500ms
    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe('done');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('logs warning on each retry', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValueOnce('ok');

    const promise = retry(fn, { delayMs: 1000, label: 'testOp' });
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');

    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('testOp failed (attempt 1/3)')
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('testOp failed (attempt 2/3)')
    );
  });

  it('throws the LAST error when all retries fail', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockRejectedValueOnce(new Error('third'));

    const assertion = expect(retry(fn, { maxRetries: 3, delayMs: 100 })).rejects.toThrow('third');
    await vi.runAllTimersAsync();
    await assertion;
  });

  it('calls fn exactly once and throws immediately with maxRetries: 1', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('instant fail'));

    const assertion = expect(retry(fn, { maxRetries: 1, delayMs: 1000 })).rejects.toThrow('instant fail');
    await assertion;
    expect(fn).toHaveBeenCalledTimes(1);
    // No warn logged because it throws on maxRetries (attempt === maxRetries)
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('defaults label to "operation" when not provided', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok');

    const promise = retry(fn, { delayMs: 1000 });
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('operation failed (attempt 1/3)')
    );
  });
});
