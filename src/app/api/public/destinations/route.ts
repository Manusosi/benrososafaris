import { NextResponse } from 'next/server';

import { getPublicDestinations } from '@/lib/public/site-data';
import {
  checkPublicApiRateLimit,
  rateLimitExceededResponse
} from '@/lib/security/public-api-guard';

export const revalidate = 300;

export async function GET(request: Request) {
  const rateLimit = checkPublicApiRateLimit(request, 'public-destinations');
  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.retryAfterSec);
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  const destinations = await getPublicDestinations(locale);

  return NextResponse.json(
    destinations.map((destination) => ({
      country: destination.country,
      id: destination.id,
      name: destination.name,
      slug: destination.slug
    })),
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    }
  );
}
