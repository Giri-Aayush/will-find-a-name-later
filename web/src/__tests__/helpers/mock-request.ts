import { NextRequest } from 'next/server';

/**
 * Helper to construct NextRequest objects for API route testing.
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
) {
  const { method = 'GET', body, headers = {} } = options ?? {};
  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)['content-type'] = 'application/json';
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as any);
}
