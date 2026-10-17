import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/api/rate-limit';

/**
 * Per-IP rate limiting for /api/* routes: 100 requests/minute.
 * Exceeding the budget returns a 429 JSON response (message in Bengali).
 */
export function middleware(request: NextRequest): NextResponse {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const { allowed, remaining, resetAt } = rateLimit(`api:${ip}`, {
    limit: 100,
    windowMs: 60_000,
  });

  if (!allowed) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'অনেক বেশি অনুরোধ। এক মিনিট পরে আবার চেষ্টা করুন।' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': String(remaining),
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
