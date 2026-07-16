import { NextResponse } from 'next/server';

import { getClientIp } from '@/lib/security/enquiry-rate-limit';

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 60;

export function isProductionRuntime() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

/** Disable leftover template/mock APIs in production. */
export function mockApiNotFoundResponse() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export function checkPublicApiRateLimit(request: Request, keyPrefix = 'public') {
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true as const };
  }

  if (bucket.count >= MAX_REQUESTS_PER_MINUTE) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { allowed: false as const, retryAfterSec };
  }

  bucket.count += 1;
  return { allowed: true as const };
}

export function rateLimitExceededResponse(retryAfterSec: number) {
  return NextResponse.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSec) }
    }
  );
}
