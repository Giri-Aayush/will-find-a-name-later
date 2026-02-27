import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

function rateLimit(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  return response;
}

export default clerkMiddleware((_auth, request) => {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
