const WINDOW_MS = 60_000;
const MAX_REQUESTS = 300;

const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

// Per-user rate limiting: keyed by "userId:action"
const userRequestMap = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequestMap) {
      if (data.resetAt < now) ipRequestMap.delete(ip);
    }
    for (const [key, data] of userRequestMap) {
      if (data.resetAt < now) userRequestMap.delete(key);
    }
  }, 60_000);
}

/** Global IP-based rate limiter (300 req/min) */
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

/** Per-user rate limiter for specific actions */
export function checkUserRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const record = userRequestMap.get(key);

  if (!record || record.resetAt < now) {
    userRequestMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  record.count++;
  const remaining = Math.max(0, maxRequests - record.count);
  return { allowed: record.count <= maxRequests, remaining };
}
