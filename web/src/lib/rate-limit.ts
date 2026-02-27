const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequestMap) {
      if (data.resetAt < now) ipRequestMap.delete(ip);
    }
  }, 60_000);
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || record.resetAt < now) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  record.count++;
  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  return { allowed: record.count <= MAX_REQUESTS, remaining };
}
